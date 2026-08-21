import express from 'express';
import { hashSessionToken } from '../utils/auth.js';
import { findSessionWithUserByTokenHash } from '../store/storage.js';

const router = express.Router();

const MAX_ATTACHMENTS = 3;
const MAX_TOTAL_ATTACHMENT_BYTES = 12 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') return '';
  const [scheme, token] = headerValue.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return '';
  return token.trim();
}

async function verifySessionUser(req) {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const result = await findSessionWithUserByTokenHash(hashSessionToken(token));
  if (!result?.session || !result?.user) {
    const error = new Error('Invalid authentication token.');
    error.statusCode = 401;
    throw error;
  }

  const expiresAtMs = new Date(result.session.expiresAt).getTime();
  if (Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now()) {
    const error = new Error('Authentication token expired.');
    error.statusCode = 401;
    throw error;
  }

  return result.user;
}

function cleanHeaderText(value, fallback = '') {
  const text = typeof value === 'string' ? value : '';
  return (text || fallback).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
}

function cleanBodyText(value) {
  const text = typeof value === 'string' ? value : '';
  return text.replace(/\r\n/g, '\n').trim().slice(0, 6000);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeFilename(value, index) {
  const fallback = `paperwork-${index + 1}.pdf`;
  const base = cleanHeaderText(value, fallback)
    .replace(/[^a-z0-9._ -]/gi, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  const filename = base || fallback;
  return filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
}

function estimateBase64Bytes(value) {
  const cleaned = value.replace(/\s/g, '');
  const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((cleaned.length * 3) / 4) - padding);
}

function normalizeAttachment(attachment, index) {
  const rawContent = typeof attachment?.contentBase64 === 'string' ? attachment.contentBase64.trim() : '';
  const contentBase64 = rawContent.includes('base64,') ? rawContent.split('base64,').pop().replace(/\s/g, '') : rawContent.replace(/\s/g, '');
  const contentType = cleanHeaderText(attachment?.contentType || 'application/pdf').toLowerCase();
  const filename = normalizeFilename(attachment?.filename, index);

  if (!contentBase64 || !/^[a-z0-9+/=]+$/i.test(contentBase64)) {
    throw new Error(`Attachment ${index + 1} is not valid Base64.`);
  }
  if (contentType !== 'application/pdf' || !filename.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF attachments are supported.');
  }

  return {
    filename,
    contentBase64,
    contentType,
    sizeBytes: estimateBase64Bytes(contentBase64),
  };
}

async function sendWithResend({ to, subject, text, html = '', attachments = [] }) {
  const apiKey = process.env.RESEND_API_KEY || '';
  const from = cleanHeaderText(process.env.EMAIL_FROM || '');
  const replyTo = cleanHeaderText(process.env.EMAIL_REPLY_TO || '');

  if (!apiKey || !from) {
    const error = new Error('Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM on the server.');
    error.statusCode = 503;
    throw error;
  }
  if (typeof fetch !== 'function') {
    const error = new Error('This server runtime does not support fetch. Use Node.js 18 or newer.');
    error.statusCode = 500;
    throw error;
  }

  const safeHtml = html || escapeHtml(text).replace(/\n/g, '<br>');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo || undefined,
      subject,
      text,
      html: safeHtml,
      attachments: attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.contentBase64,
      })),
    }),
  });

  const responseText = await response.text();
  let payload = null;
  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || responseText || 'Email provider rejected the request.';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return payload || {};
}

function getSessionUserName(user, fallback = '') {
  return cleanHeaderText(user?.name || fallback || '', 120);
}

function buildWelcomeEmailText({ name }) {
  const greeting = name ? `Hi ${name},` : 'Hi,';
  return [
    greeting,
    '',
    'Welcome to PapersCart.',
    '',
    'Your workspace is ready for creating invoices, agreements, project timelines, and client-ready PDF paperwork.',
    '',
    'A good place to start:',
    '- Add your business profile once.',
    '- Save your client details.',
    '- Create your first invoice, agreement, or timeline.',
    '',
    'If you need help, reply to this email or contact support@paperscart.com.',
    '',
    'Regards,',
    'PapersCart Support',
  ].join('\n');
}

function buildWelcomeEmailHtml({ name }) {
  const safeName = escapeHtml(name || '');
  const greeting = safeName ? `Hi ${safeName},` : 'Hi,';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to PapersCart</title>
  </head>
  <body style="margin:0;background:#f3f8f5;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your PapersCart workspace is ready for invoices, agreements, timelines, and client paperwork.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f8f5;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dce7e1;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:#2f7d4f;padding:30px 30px 26px;">
                <div style="display:inline-block;background:#ffffff;border-radius:12px;padding:10px 14px;color:#55b66e;font-size:20px;font-weight:800;letter-spacing:.2px;">
                  PapersCart
                </div>
                <h1 style="margin:28px 0 8px;color:#ffffff;font-size:32px;line-height:1.12;font-weight:800;">
                  Your paperwork workspace is ready.
                </h1>
                <p style="margin:0;color:#d9f4e4;font-size:16px;line-height:1.6;">
                  Create, save, and send client-ready invoices, agreements, and timelines from one place.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
                  ${greeting}
                </p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#334155;">
                  Welcome to PapersCart. Your account is ready, and you can start setting up your business profile and reusable client paperwork.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;border:1px solid #dce7e1;border-radius:14px;background:#f8fbf9;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 14px;color:#2f7d4f;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">
                        Start with these steps
                      </p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.5;">
                            <strong style="color:#0f172a;">1. Add your business profile</strong><br>
                            Save your name, logo, address, payment details, and default document settings.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.5;">
                            <strong style="color:#0f172a;">2. Save client details</strong><br>
                            Reuse client information across invoices, agreements, and timelines.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#334155;font-size:15px;line-height:1.5;">
                            <strong style="color:#0f172a;">3. Download or email polished PDFs</strong><br>
                            Review every document before sending it to your client.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <a href="https://paperscart.com" style="display:inline-block;background:#2f7d4f;color:#ffffff;text-decoration:none;border-radius:10px;padding:13px 20px;font-size:15px;font-weight:800;">
                        Open PapersCart
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:26px 0 0;color:#64748b;font-size:14px;line-height:1.7;">
                  Need help? Reply to this email or contact support@paperscart.com.
                </p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e5ece8;padding:18px 30px;background:#fbfdfc;color:#64748b;font-size:12px;line-height:1.6;">
                PapersCart by AR Group. Transactional account email for your PapersCart workspace.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

router.post('/welcome', async (req, res) => {
  let sessionUser;
  try {
    sessionUser = await verifySessionUser(req);
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: error.message });
  }

  const recipient = cleanHeaderText(sessionUser?.email || '').toLowerCase();
  const name = getSessionUserName(sessionUser, req.body?.name);

  if (!EMAIL_PATTERN.test(recipient)) {
    return res.status(400).json({ error: 'A valid signed-in user email is required.' });
  }

  try {
    const payload = await sendWithResend({
      to: recipient,
      subject: 'Welcome to PapersCart',
      text: buildWelcomeEmailText({ name }),
      html: buildWelcomeEmailHtml({ name }),
      attachments: [],
    });
    res.json({ ok: true, id: payload.id || null });
  } catch (error) {
    res.status(error.statusCode || 502).json({ error: error.message || 'Welcome email send failed.' });
  }
});

router.post('/paperwork', async (req, res) => {
  try {
    req.authUser = await verifySessionUser(req);
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: error.message });
  }

  const { to, subject, bodyText, attachments } = req.body || {};
  const recipient = cleanHeaderText(to).toLowerCase();
  const safeSubject = cleanHeaderText(subject, 'Project paperwork');
  const safeBodyText = cleanBodyText(bodyText);

  if (!EMAIL_PATTERN.test(recipient)) {
    return res.status(400).json({ error: 'A valid recipient email is required.' });
  }
  if (!safeBodyText) {
    return res.status(400).json({ error: 'Email body is required.' });
  }
  if (!Array.isArray(attachments) || attachments.length === 0 || attachments.length > MAX_ATTACHMENTS) {
    return res.status(400).json({ error: `Send between 1 and ${MAX_ATTACHMENTS} PDF attachments.` });
  }

  let normalizedAttachments;
  try {
    normalizedAttachments = attachments.map(normalizeAttachment);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const totalBytes = normalizedAttachments.reduce((sum, attachment) => sum + attachment.sizeBytes, 0);
  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
    return res.status(413).json({ error: 'PDF attachments are too large to email together.' });
  }

  try {
    const payload = await sendWithResend({
      to: recipient,
      subject: safeSubject,
      text: safeBodyText,
      attachments: normalizedAttachments,
    });
    res.json({ ok: true, id: payload.id || null });
  } catch (error) {
    res.status(error.statusCode || 502).json({ error: error.message || 'Email send failed.' });
  }
});

export default router;
