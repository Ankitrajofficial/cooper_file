import express from 'express';
import { resolveProvider, callProvider, parseModelJson } from '../llm.js';

const router = express.Router();

const MAX_MILESTONES = 8;

function cleanText(value, max = 1200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanDate(value) {
  // Only accept the ISO shape the date inputs use, and only if it is a real
  // calendar date — the shape alone would let "2026-13-99" through, and a
  // hallucinated "next Tuesday" must never land in a date field.
  const text = cleanText(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
  const parsed = new Date(`${text}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text ? '' : text;
}

function buildSystemPrompt() {
  return [
    'You are a paperwork drafter for freelancers using PapersCart.',
    'You turn a short brief into three documents: a project agreement, a scope of work, and a delivery timeline.',
    '',
    'RULES:',
    '- Write in plain, professional English a client can read without a lawyer.',
    '- Be concrete and specific to the brief. Never write placeholder text like "TBD" or "[insert]".',
    '- Use ONLY the figures, dates, and names given in the brief. Never invent amounts, rates, or client details.',
    '- If the brief gives an invoice total or due date, reference those exact values in payment terms.',
    '- Deliverables should be one item per line, no bullet characters.',
    '- Out of scope must list realistic exclusions for this kind of work, so extra requests become a new quote.',
    '- Milestone dueDate must be YYYY-MM-DD and fall inside the project dates when they are given.',
    '',
    'OUTPUT FORMAT — reply with a single JSON object and nothing else:',
    '{',
    '  "projectName": "<short project name>",',
    '  "agreement": { "scope": "...", "deliverables": "...", "paymentTerms": "...", "specialTerms": "..." },',
    '  "scope": { "overview": "...", "deliverables": "...", "outOfScope": "...", "assumptions": "...", "acceptanceCriteria": "...", "revisionRounds": "..." },',
    '  "timeline": { "milestones": [ { "phase": "...", "description": "...", "dueDate": "YYYY-MM-DD" } ] }',
    '}',
    `Give between 3 and ${MAX_MILESTONES} milestones.`,
  ].join('\n');
}

function buildBrief(body) {
  const answers = body?.answers && typeof body.answers === 'object' ? body.answers : {};
  const context = body?.context && typeof body.context === 'object' ? body.context : {};

  const lines = [
    `Service provider: ${cleanText(context.companyName, 120) || 'the freelancer'}`,
    `Client: ${cleanText(context.clientName, 120) || 'the client'}`,
    `What the project is: ${cleanText(answers.projectSummary, 900) || 'not stated'}`,
    `What the client receives: ${cleanText(answers.deliverables, 900) || 'not stated'}`,
    `Duration / deadline: ${cleanText(answers.duration, 300) || 'not stated'}`,
    `Payment arrangement: ${cleanText(answers.paymentTerms, 300) || 'not stated'}`,
    `Explicitly excluded: ${cleanText(answers.exclusions, 600) || 'not stated — infer sensible exclusions'}`,
    `Start date: ${cleanDate(context.startDate) || 'not stated'}`,
    `End date: ${cleanDate(context.endDate) || 'not stated'}`,
  ];

  // Invoice facts, so the drafted terms line up with what was actually billed.
  if (context.invoiceNumber || context.invoiceTotal || context.invoiceDueDate) {
    lines.push('', 'From this client\'s invoice (use these exact figures):');
    if (context.invoiceNumber) lines.push(`- Invoice number: ${cleanText(context.invoiceNumber, 60)}`);
    if (context.invoiceTotal) lines.push(`- Invoice total: ${cleanText(context.invoiceTotal, 40)}`);
    if (context.invoiceDueDate) lines.push(`- Payment due: ${cleanDate(context.invoiceDueDate)}`);
    const items = Array.isArray(context.invoiceItems) ? context.invoiceItems.slice(0, 20) : [];
    if (items.length) {
      lines.push('- Billed line items:');
      items.forEach((item) => {
        const description = cleanText(item?.description, 160);
        if (description) lines.push(`  • ${description}${item?.quantity ? ` (qty ${cleanText(String(item.quantity), 12)})` : ''}`);
      });
    }
  }

  return lines.join('\n');
}

// The model's reply is untrusted: rebuild the payload field by field so only
// known keys, capped lengths, and valid dates reach the client.
function normalizeDraft(parsed) {
  const agreement = parsed?.agreement && typeof parsed.agreement === 'object' ? parsed.agreement : {};
  const scope = parsed?.scope && typeof parsed.scope === 'object' ? parsed.scope : {};
  const timeline = parsed?.timeline && typeof parsed.timeline === 'object' ? parsed.timeline : {};
  const rawMilestones = Array.isArray(timeline.milestones) ? timeline.milestones : [];

  return {
    projectName: cleanText(parsed?.projectName, 120),
    agreement: {
      scope: cleanText(agreement.scope, 2000),
      deliverables: cleanText(agreement.deliverables, 2000),
      paymentTerms: cleanText(agreement.paymentTerms, 1200),
      specialTerms: cleanText(agreement.specialTerms, 1200),
    },
    scope: {
      overview: cleanText(scope.overview, 2000),
      deliverables: cleanText(scope.deliverables, 2000),
      outOfScope: cleanText(scope.outOfScope, 2000),
      assumptions: cleanText(scope.assumptions, 2000),
      acceptanceCriteria: cleanText(scope.acceptanceCriteria, 1200),
      revisionRounds: cleanText(scope.revisionRounds, 120),
    },
    timeline: {
      milestones: rawMilestones
        .filter((milestone) => milestone && typeof milestone === 'object')
        .slice(0, MAX_MILESTONES)
        .map((milestone) => ({
          phase: cleanText(milestone.phase, 80),
          description: cleanText(milestone.description, 400),
          dueDate: cleanDate(milestone.dueDate),
          status: 'Pending',
        }))
        .filter((milestone) => milestone.phase || milestone.description),
    },
  };
}

function hasContent(draft) {
  return Boolean(
    draft.agreement.scope ||
      draft.scope.overview ||
      draft.timeline.milestones.length
  );
}

router.post('/draft', async (req, res) => {
  const provider = resolveProvider();
  if (!provider.apiKey) {
    return res.status(503).json({
      error: `AI drafting is not configured (${provider.name}). Set the provider API key on the server.`,
    });
  }
  if (typeof fetch !== 'function') {
    return res.status(500).json({ error: 'This server runtime lacks fetch. Use Node.js 18+.' });
  }

  const answers = req.body?.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
  if (!cleanText(answers.projectSummary, 900)) {
    return res.status(400).json({ error: 'Describe the project before generating paperwork.' });
  }

  const brief = buildBrief(req.body);

  try {
    const raw = await callProvider(
      provider,
      buildSystemPrompt(),
      [{ role: 'user', content: brief }],
      { maxTokens: 2000 }
    );
    const draft = normalizeDraft(parseModelJson(raw) || {});

    if (!hasContent(draft)) {
      return res.status(502).json({ error: 'The model did not return usable paperwork. Try again with more detail.' });
    }

    res.json({ draft, provider: provider.name });
  } catch (error) {
    res.status(error.statusCode || 502).json({ error: error.message || 'AI drafting failed.' });
  }
});

export default router;
