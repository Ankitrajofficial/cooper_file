import React from 'react';
import { Building2, CheckCircle2, CreditCard, FileBadge2, History, ImagePlus, Lock, ShieldCheck, Trash2, Unlock } from 'lucide-react';
import {
  BUSINESS_DOCUMENT_OPTIONS,
  COMPANY_PROFILE_FIELDS,
  getBusinessDocumentPlaceholder,
  getCompanyProfileCompletion,
} from '../utils/companyProfile';

function formatUpdatedAt(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function CompanyProfileForm({
  company,
  isLocked,
  profileSyncError = '',
  profileSyncStatus = 'idle',
  storageLabel = 'locally',
  updatedAt,
  onChange,
  onLock,
  onUnlock,
  onReset,
}) {
  const { isComplete, missingFields } = getCompanyProfileCompletion(company);
  const documentType = company.businessDocumentType || '';
  const showCustomDocumentLabel = documentType === 'other';
  const isSettingsLocked = Boolean(isLocked);
  const isBankDetailsLocked = isSettingsLocked;
  const requiredFields = COMPANY_PROFILE_FIELDS.filter((field) => field.required);
  const completedRequiredCount = requiredFields.length - missingFields.length;
  const completionPercent = Math.round((completedRequiredCount / requiredFields.length) * 100);
  const fieldByKey = Object.fromEntries(COMPANY_PROFILE_FIELDS.map((field) => [field.key, field]));
  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';
  const bankFields = [
    { key: 'upiId', label: 'UPI ID', placeholder: 'johndoe@okicici', className: 'md:col-span-2' },
    { key: 'bankAccountName', label: 'Account Holder Name', placeholder: 'Account holder name' },
    { key: 'bankName', label: 'Bank Name', placeholder: 'Bank name' },
    { key: 'bankAccountNumber', label: 'Account Number', placeholder: 'Account number' },
    { key: 'bankIfscCode', label: 'IFSC Code', placeholder: 'IFSC code' },
    { key: 'bankBranch', label: 'Branch', placeholder: 'Branch name or address', className: 'md:col-span-2' },
  ];
  const logoInputId = 'business-logo-upload';

  const confirmProfileChange = (message) => {
    if (typeof window === 'undefined') return true;
    return window.confirm(message);
  };

  const handleReset = () => {
    if (!confirmProfileChange('Clear the business profile details from this dashboard?')) return;
    onReset();
  };

  const handleRemoveLogo = () => {
    if (!confirmProfileChange('Remove the business logo from this dashboard?')) return;
    onChange({ logoDataUrl: '' });
  };

  const handleLogoFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Please upload an image file for the logo.');
      return;
    }

    if (file.size > 700 * 1024) {
      window.alert('Please choose a logo below 700 KB so it can sync reliably.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logoDataUrl: typeof reader.result === 'string' ? reader.result : '' });
    };
    reader.readAsDataURL(file);
  };

  const renderTextField = (key, { className = '', rows } = {}) => {
    const field = fieldByKey[key];
    if (!field) return null;

    return (
      <label key={key} className={`block ${className}`}>
        <span className={labelClass}>
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </span>
        {rows ? (
          <textarea
            value={company[key] || ''}
            onChange={(e) => onChange({ [key]: e.target.value })}
            disabled={isLocked}
            rows={rows}
            className={`${inputClass} resize-y`}
            placeholder={field.placeholder}
          />
        ) : (
          <input
            type="text"
            value={company[key] || ''}
            onChange={(e) => onChange({ [key]: e.target.value })}
            disabled={isLocked}
            className={inputClass}
            placeholder={field.placeholder}
          />
        )}
      </label>
    );
  };

  const renderBankField = ({ key, label, placeholder, className = '' }) => (
    <label key={key} className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      <input
        type="text"
        value={company[key] || ''}
        onChange={(e) => onChange({ [key]: e.target.value })}
        disabled={isBankDetailsLocked}
        className={inputClass}
        placeholder={placeholder}
      />
    </label>
  );

  const renderHistoryToggle = (key, label, description) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50">
      <input
        type="checkbox"
        checked={company[key] !== false}
        onChange={(event) => onChange({ [key]: event.target.checked })}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span>
        <span className="block text-sm font-black text-slate-800">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>
      </span>
    </label>
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-slate-950 sm:text-xl">Business Profile</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  isLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isLocked ? <ShieldCheck size={14} /> : <Unlock size={14} />}
                {isLocked ? 'Locked' : 'Draft'}
              </span>
              {profileSyncStatus === 'saving' && (
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">Syncing</span>
              )}
              {profileSyncStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={13} />
                  Synced
                </span>
              )}
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Add these details once and they will appear across every document. Draft changes save {storageLabel}.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-[260px]">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Required profile fields</span>
                <span>{completedRequiredCount}/{requiredFields.length}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLocked ? (
                <button
                  type="button"
                  onClick={onUnlock}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 touch-ignore"
                >
                  <Unlock size={16} />
                  Unlock settings
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLock}
                  disabled={!isComplete}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 touch-ignore"
                >
                  <Lock size={16} />
                  Lock settings
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                disabled={isLocked}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 touch-ignore"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        {!isLocked && !isComplete && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <span className="font-bold">Complete before locking:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span key={field.key} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-800">
                  {field.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {(updatedAt || profileSyncStatus === 'error' || profileSyncError) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {updatedAt && <span>Last saved {storageLabel}: {formatUpdatedAt(updatedAt)}</span>}
            {profileSyncStatus === 'error' && (
              <span className="rounded-full bg-red-50 px-2 py-1 font-bold text-red-700">
                Sync failed{profileSyncError ? `: ${profileSyncError}` : ''}
              </span>
            )}
          </div>
        )}

        <div>
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-emerald-700" />
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Business identity</h3>
          </div>
          <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                  {company.logoDataUrl ? (
                    <img
                      src={company.logoDataUrl}
                      alt="Business logo preview"
                      className="max-h-14 max-w-14 object-contain"
                    />
                  ) : (
                    <ImagePlus size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">Business logo</p>
                  <p className="text-sm text-slate-500">
                    Appears on invoices, agreements, lead sheets, timelines, and QR cards.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label
                  htmlFor={logoInputId}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors ${
                    isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'
                  }`}
                >
                  <ImagePlus size={16} />
                  {company.logoDataUrl ? 'Change logo' : 'Upload logo'}
                </label>
                <input
                  id={logoInputId}
                  type="file"
                  accept="image/*"
                  disabled={isLocked}
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
                {company.logoDataUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isLocked}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderTextField('companyName')}
            {renderTextField('founderName')}
            {renderTextField('address', { rows: 3, className: 'md:col-span-2' })}
            {renderTextField('mobileNumber')}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CreditCard size={18} className="text-emerald-700" />
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Payment and bank details</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    isSettingsLocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isSettingsLocked ? <ShieldCheck size={13} /> : <Unlock size={13} />}
                  {isSettingsLocked ? 'Locked' : 'Editable'}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Saved UPI and bank details will appear on invoices and receipts automatically.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {bankFields.map(renderBankField)}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <FileBadge2 size={18} className="text-emerald-700" />
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Registration details</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Document Type</span>
            <select
              value={documentType}
              onChange={(e) => onChange({ businessDocumentType: e.target.value })}
              disabled={isLocked}
                className={inputClass}
            >
              {BUSINESS_DOCUMENT_OPTIONS.map((option) => (
                <option key={option.value || 'empty'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            </label>

            <label className="block">
              <span className={labelClass}>Document Number</span>
            <input
              type="text"
              value={company.businessDocumentValue || ''}
              onChange={(e) => onChange({ businessDocumentValue: e.target.value })}
              disabled={isLocked}
                className={inputClass}
              placeholder={getBusinessDocumentPlaceholder(documentType)}
            />
            </label>

          {showCustomDocumentLabel && (
              <label className="block md:col-span-2">
                <span className={labelClass}>Custom Document Label</span>
              <input
                type="text"
                value={company.businessDocumentCustomLabel || ''}
                onChange={(e) => onChange({ businessDocumentCustomLabel: e.target.value })}
                disabled={isLocked}
                  className={inputClass}
                placeholder="e.g. Trade License, Shop Act, IEC"
              />
              </label>
          )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <History size={18} className="text-emerald-700" />
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">History settings</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {renderHistoryToggle(
              'historyAutoSaveOnDownload',
              'Auto-save after download',
              'Invoices, agreements, and timelines are saved to history after a successful PDF download.'
            )}
            {renderHistoryToggle(
              'historyAvoidDuplicateDownloads',
              'Avoid duplicate download entries',
              'Repeated downloads of the same document update one history record instead of creating clutter.'
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">
            <CreditCard size={17} className="mt-0.5 shrink-0 text-slate-500" />
            <p>
              Payment QR cards can use your UPI ID. Bank details sync with your profile, while document details can be saved manually or automatically after PDF downloads.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
