import express from 'express';
import {
  createHistoryEntry,
  deleteHistoryEntry,
  findHistoryEntryById,
  getUserId,
  listHistoryEntries,
  updateHistoryEntry,
} from '../store/storage.js';

const router = express.Router();
const VALID_DOC_TYPES = ['invoice', 'agreement', 'scope', 'timeline', 'leadsheet', 'qrcard'];

function toClient(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id?.toString() || o.id,
    savedAt: o.createdAt || o.savedAt,
    label: o.label,
    company: o.company,
    data: o.data,
    meta: o.meta ?? null,
  };
}

// GET /api/history/:docType/:id — get single entry (for load); must be before GET /:docType
router.get('/:docType/:id', async (req, res) => {
  const { docType, id } = req.params;
  if (!VALID_DOC_TYPES.includes(docType)) {
    return res.status(400).json({ error: 'Invalid docType' });
  }
  try {
    const doc = await findHistoryEntryById(id, docType, getUserId(req.auth.user));
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(toClient(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history/:docType — list entries for a document type
router.get('/:docType', async (req, res) => {
  const { docType } = req.params;
  if (!VALID_DOC_TYPES.includes(docType)) {
    return res.status(400).json({ error: 'Invalid docType' });
  }
  try {
    const docs = await listHistoryEntries(docType, getUserId(req.auth.user));
    const entries = docs.map((d) => ({
      ...toClient(d),
      savedAt: d.createdAt || d.savedAt,
    }));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/history/:docType — create entry
router.post('/:docType', async (req, res) => {
  const { docType } = req.params;
  if (!VALID_DOC_TYPES.includes(docType)) {
    return res.status(400).json({ error: 'Invalid docType' });
  }
  const { label, company, data, meta } = req.body || {};
  if (!company || !data) {
    return res.status(400).json({ error: 'company and data are required' });
  }
  try {
    const doc = await createHistoryEntry({
      userId: getUserId(req.auth.user),
      docType,
      label: label || `${docType} ${new Date().toISOString().slice(0, 10)}`,
      company,
      data,
      meta: meta || null,
    });
    res.status(201).json(toClient(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/history/:docType/:id — update (e.g. rename)
router.patch('/:docType/:id', async (req, res) => {
  const { docType, id } = req.params;
  if (!VALID_DOC_TYPES.includes(docType)) {
    return res.status(400).json({ error: 'Invalid docType' });
  }
  try {
    const doc = await updateHistoryEntry(id, docType, getUserId(req.auth.user), req.body);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(toClient(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/history/:docType/:id
router.delete('/:docType/:id', async (req, res) => {
  const { docType, id } = req.params;
  if (!VALID_DOC_TYPES.includes(docType)) {
    return res.status(400).json({ error: 'Invalid docType' });
  }
  try {
    const result = await deleteHistoryEntry(id, docType, getUserId(req.auth.user));
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
