import React, { useState, useEffect } from 'react';
import { History, Save, Loader2, Trash2, ChevronDown, ChevronUp, Copy, Pencil, Database } from 'lucide-react';
import { getHistory, saveToHistory, deleteFromHistory, getHistoryEntry, updateHistoryEntry, isUsingMongo } from '../utils/historyStorage';
import { getDocumentDataByType, getDocumentHistoryLabel, getDocumentHistoryMeta } from '../utils/documentHistoryMetadata';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso || '';
  }
}

export default function DocumentHistory({
  docType,
  company,
  invoice,
  agreement,
  scope,
  timeline,
  leadSheet,
  qrCard,
  onLoad,
  onSaveComplete,
  refreshToken = 0,
  // Rendered inside the nav dropdown, which supplies its own card and heading:
  // drop the standalone card chrome and stay open instead of self-collapsing.
  embedded = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent'); // recent | oldest
  const [statusFilter, setStatusFilter] = useState('all'); // invoice only
  const [notice, setNotice] = useState({ type: '', message: '' });

  const refresh = () => {
    setLoading(true);
    return getHistory(docType)
      .then((list) => {
        setEntries(Array.isArray(list) ? list : []);
        setLoading(false);
        return list;
      })
      .catch((err) => {
        setNotice({ type: 'error', message: err.message || 'History failed to load.' });
        setLoading(false);
        return [];
      });
  };

  useEffect(() => {
    setNotice({ type: '', message: '' });
    refresh();
  }, [docType, refreshToken]);

  const getCurrentData = () =>
    getDocumentDataByType(docType, { invoice, agreement, scope, timeline, leadSheet, qrCard });

  const getMetaForData = (data) => getDocumentHistoryMeta(docType, data);

  const getLabel = (data) => getDocumentHistoryLabel(docType, data);

  const handleSave = async () => {
    const data = getCurrentData();
    if (!data) return;
    setSaving(true);
    setNotice({ type: '', message: '' });
    try {
      const meta = getMetaForData(data);
      await saveToHistory(docType, {
        label: getLabel(data),
        company: { ...company },
        data: JSON.parse(JSON.stringify(data)),
        meta,
      });
      await refresh();
      setNotice({ type: 'success', message: 'Saved to history.' });
      onSaveComplete?.();
    } catch (err) {
      console.warn('Save to history failed:', err);
      setNotice({ type: 'error', message: err.message || 'Save to history failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id) => {
    setNotice({ type: '', message: '' });
    try {
      const entry = await getHistoryEntry(docType, id);
      if (!entry) return;
      onLoad(entry.company, entry.data);
      setExpanded(false);
    } catch (err) {
      console.warn('Load from history failed:', err);
      setNotice({ type: 'error', message: err.message || 'Load from history failed.' });
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const entry = entries.find((item) => item.id === id);
    const label = entry?.label || 'this saved record';
    if (typeof window !== 'undefined' && !window.confirm(`Remove "${label}" from history?`)) return;
    try {
      await deleteFromHistory(docType, id);
      await refresh();
      setNotice({ type: 'success', message: 'Removed from history.' });
    } catch (err) {
      console.warn('Delete from history failed:', err);
      setNotice({ type: 'error', message: err.message || 'Delete from history failed.' });
    }
  };

  const handleRename = async (entry) => {
    const next = window.prompt('Rename saved record', entry.label || '');
    if (!next) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === entry.label) return;
    try {
      await updateHistoryEntry(docType, entry.id, { label: trimmed });
      await refresh();
      setNotice({ type: 'success', message: 'History record renamed.' });
    } catch (err) {
      console.warn('Rename failed:', err);
      setNotice({ type: 'error', message: err.message || 'Rename failed.' });
    }
  };

  const handleDuplicate = async (entry) => {
    const meta = entry.meta || getMetaForData(entry.data);
    const baseLabel = entry.label || getLabel(entry.data);
    const copyLabel = `${baseLabel} (copy)`;
    try {
      await saveToHistory(docType, {
        label: copyLabel,
        company: { ...(entry.company || {}) },
        data: JSON.parse(JSON.stringify(entry.data || {})),
        meta,
      });
      await refresh();
      setNotice({ type: 'success', message: 'Duplicated in history.' });
    } catch (err) {
      console.warn('Duplicate failed:', err);
      setNotice({ type: 'error', message: err.message || 'Duplicate failed.' });
    }
  };

  const getMetaForEntry = (entry) => entry.meta || getMetaForData(entry.data);

  const filteredEntries = (() => {
    const term = search.trim().toLowerCase();
    let list = entries.slice();

    if (docType === 'invoice' && statusFilter !== 'all') {
      list = list.filter((entry) => {
        const meta = getMetaForEntry(entry);
        const status = (meta.status || '').toLowerCase();
        if (statusFilter === 'paid') return status === 'paid';
        if (statusFilter === 'unpaid') return status === 'unpaid';
        return true;
      });
    }

    if (term) {
      list = list.filter((entry) => {
        const meta = getMetaForEntry(entry);
        const haystack = [
          entry.label,
          entry.savedAt,
          meta.clientName,
          meta.projectName,
          meta.status,
          meta.firstLead,
          meta.hostelName,
          meta.purpose,
          meta.stateOperatingHead,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.savedAt).getTime();
      const db = new Date(b.savedAt).getTime();
      return sort === 'oldest' ? da - db : db - da;
    });

    return list;
  })();

  const count = entries.length;
  const docLabel =
    docType === 'invoice' ? 'Invoices' :
    docType === 'agreement' ? 'Agreements' :
    docType === 'timeline' ? 'Timelines' :
    docType === 'qrcard' ? 'QR Cards' :
    docType === 'shippinglabel' ? 'Shipping labels' :
    docType === 'templates' ? 'Templates' : 'Lead sheets';
  const emptyHistoryText = ['invoice', 'agreement', 'timeline'].includes(docType)
    ? 'No saved records yet. Downloads can appear here automatically when auto-save is enabled, and you can still save manually.'
    : 'No saved records yet. Save the current document to add one.';

  const isOpen = embedded || expanded;

  return (
    <div
      className={
        embedded ? '' : 'bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden'
      }
    >
      {!embedded && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-gray-50 transition-colors touch-ignore"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm sm:text-base flex-wrap">
            <History size={18} className="sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            History — {docLabel}
            {count > 0 && (
              <span className="text-xs sm:text-sm font-normal text-gray-500">({count} saved)</span>
            )}
            {isUsingMongo() && (
              <span className="flex items-center gap-1 text-xs font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded" title="History stored through the backend API">
                <Database size={12} /> API
              </span>
            )}
          </span>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      )}

      {isOpen && (
        <div
          className={
            embedded
              ? 'p-3 sm:p-4 space-y-4'
              : 'border-t border-gray-100 p-3 sm:p-4 space-y-4'
          }
        >
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs sm:text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 touch-ignore"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save current to history
            </button>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-2 text-sm w-full sm:w-auto">
              {docType === 'invoice' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-2 py-2 sm:py-1.5 border border-gray-200 rounded-md text-xs bg-white touch-ignore"
                >
                  <option value="all">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto px-2 py-2 sm:py-1.5 border border-gray-200 rounded-md text-xs bg-white touch-ignore"
              >
                <option value="recent">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by label, client, project..."
                className="w-full sm:min-w-[160px] px-2 py-2 sm:py-1.5 border border-gray-200 rounded-md text-xs bg-white touch-ignore"
              />
          </div>
          </div>

          {notice.message && (
            <p
              className={`rounded-lg px-3 py-2 text-xs sm:text-sm ${
                notice.type === 'error'
                  ? 'border border-red-200 bg-red-50 text-red-700'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {notice.message}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading history…
            </p>
          ) : entries.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
              {emptyHistoryText}
            </p>
          ) : (
            <ul className="space-y-2 max-h-56 sm:max-h-64 overflow-y-auto -mx-1 px-1">
              {filteredEntries.map((entry) => {
                const meta = getMetaForEntry(entry);
                const secondLine =
                  docType === 'invoice'
                    ? [
                        meta.clientName && `Client: ${meta.clientName}`,
                        meta.status && `Status: ${meta.status}`,
                        typeof meta.amount === 'number' && !Number.isNaN(meta.amount)
                          ? `Amount: ₹${meta.amount.toFixed(2)}`
                          : null,
                      ].filter(Boolean).join(' • ')
                    : docType === 'agreement'
                    ? [
                        meta.projectName && `Project: ${meta.projectName}`,
                        meta.clientName && `Client: ${meta.clientName}`,
                      ].filter(Boolean).join(' • ')
                    : docType === 'timeline'
                    ? [
                        meta.projectName && `Project: ${meta.projectName}`,
                        (meta.startDate || meta.endDate) &&
                          `Period: ${(meta.startDate || '—')} – ${(meta.endDate || '—')}`,
                      ].filter(Boolean).join(' • ')
                    : docType === 'qrcard'
                    ? [
                        meta.hostelName && `Name: ${meta.hostelName}`,
                        meta.purpose && `Purpose: ${meta.purpose}`,
                        meta.stateOperatingHead && `Head: ${meta.stateOperatingHead}`,
                      ].filter(Boolean).join(' • ')
                    : docType === 'shippinglabel'
                    ? [
                        meta.clientName && `Customer: ${meta.clientName}`,
                        meta.clientPhone && `Phone: ${meta.clientPhone}`,
                        meta.invoiceNumber && `Invoice: ${meta.invoiceNumber}`,
                      ].filter(Boolean).join(' • ')
                    : docType === 'templates'
                    ? [
                        meta.invoiceLabel && `Label: ${meta.invoiceLabel}`,
                        meta.invoiceTemplate && `Style: ${meta.invoiceTemplate}`,
                      ].filter(Boolean).join(' • ')
                    : [
                        typeof meta.leadCount === 'number' && `Leads: ${meta.leadCount}`,
                        meta.firstLead && `First: ${meta.firstLead}`,
                      ].filter(Boolean).join(' • ');

                return (
                <li
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-2 sm:px-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{entry.label}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatDate(entry.savedAt)}
                      {secondLine && <> • {secondLine}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleLoad(entry.id)}
                      className="px-2 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100 touch-ignore"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(entry)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRename(entry)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                      title="Rename"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Remove from history"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
