import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createEmptyCompanyProfile, normalizeCompanyProfile } from '../utils/companyProfile';
import { readStoredDocumentDrafts, writeStoredDocumentDrafts } from '../utils/documentDraftStorage';
import { readStoredCompanyProfile, writeStoredCompanyProfile } from '../utils/profileStorage';

const defaultCompany = createEmptyCompanyProfile();

export const createDefaultInvoice = () => ({
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  shippingAddress: '',
  stateOperatingHead: '',
  invoiceNumber: '',
  invoiceNumberIssuedDate: '',
  invoiceLabel: 'INVOICE',
  invoiceTemplate: 'clean',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'Unpaid',
  paymentMethod: '',
  paymentDate: new Date().toISOString().split('T')[0],
  discountLabel: 'Discount',
  discountType: 'amount',
  discountValue: 0,
  gstRate: 0,
  paymentRequestType: 'advance_percent',
  paymentRequestValue: 50,
  bankAccountName: '',
  bankName: '',
  bankAccountNumber: '',
  bankIfscCode: '',
  bankBranch: '',
  footerNote: 'Thank you for your business!',
  paymentTermsNote: 'Payment is due within 15 days.',
  items: [{ description: 'Web Development Services', quantity: 1, price: 5000 }],
});

export const createDefaultAgreement = () => ({
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  stateOperatingHead: '',
  projectName: '',
  agreementNumber: 'AGR-001',
  date: new Date().toISOString().split('T')[0],
  scope: '',
  deliverables: '',
  startDate: '',
  endDate: '',
  paymentTerms: '',
  specialTerms: '',
});

export const createDefaultScope = () => ({
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  projectName: '',
  scopeNumber: 'SOW-001',
  date: new Date().toISOString().split('T')[0],
  overview: '',
  deliverables: '',
  // The exclusions list is the point of a standalone scope document: it is what
  // stops "can you just also..." from turning into unpaid work.
  outOfScope: '',
  assumptions: '',
  acceptanceCriteria: '',
  revisionRounds: '',
  startDate: '',
  endDate: '',
});

export const createDefaultTimeline = () => ({
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  stateOperatingHead: '',
  projectName: '',
  date: new Date().toISOString().split('T')[0],
  startDate: '',
  endDate: '',
  milestones: [
    { phase: 'Kickoff', description: 'Project kickoff and requirements', dueDate: '', status: 'Pending' },
    { phase: 'Development', description: 'Core development', dueDate: '', status: 'Pending' },
    { phase: 'Review', description: 'Review and feedback', dueDate: '', status: 'Pending' },
    { phase: 'Delivery', description: 'Final delivery', dueDate: '', status: 'Pending' },
  ],
});

export const createDefaultLeadSheet = () => ({
  stateOperatingHead: '',
  leads: [
    { name: '', phone: '', address: '', status: '', contactDate: '', notes: '' },
    { name: '', phone: '', address: '', status: '', contactDate: '', notes: '' },
  ],
});

export const createDefaultQRCard = () => ({
  hostelName: '',
  stateOperatingHead: '',
  purpose: 'Scan to Pay / Connect',
  theme: 'theme-default',
  qrImage: null, // base64 data url
  qrMessage: 'Fast & secure. Connect with us instantly.',
});

const BusinessDataContext = createContext(null);

const BANK_DETAIL_KEYS = ['bankAccountName', 'bankName', 'bankAccountNumber', 'bankIfscCode', 'bankBranch'];

function getBankDetailsFromCompany(company) {
  const normalized = normalizeCompanyProfile(company);
  return BANK_DETAIL_KEYS.reduce((details, key) => {
    details[key] = normalized[key] || '';
    return details;
  }, {});
}

function normalizeCompanyProfileState(profileState) {
  return {
    company: normalizeCompanyProfile(profileState?.company),
    isLocked: Boolean(profileState?.isLocked),
    updatedAt: typeof profileState?.updatedAt === 'string' ? profileState.updatedAt : null,
  };
}

function getObjectDraft(draft) {
  return draft && typeof draft === 'object' && !Array.isArray(draft) ? draft : {};
}

function createInvoiceState(company, storedDraft) {
  const defaults = createDefaultInvoice();
  const draft = getObjectDraft(storedDraft);

  return {
    ...defaults,
    ...draft,
    items: Array.isArray(draft.items)
      ? draft.items.map((item) => ({
          description: '',
          quantity: 1,
          price: 0,
          ...(item && typeof item === 'object' ? item : {}),
        }))
      : defaults.items,
    ...getBankDetailsFromCompany(company),
  };
}

function createAgreementState(storedDraft) {
  return {
    ...createDefaultAgreement(),
    ...getObjectDraft(storedDraft),
  };
}

function createScopeState(storedDraft) {
  return {
    ...createDefaultScope(),
    ...getObjectDraft(storedDraft),
  };
}

function createTimelineState(storedDraft) {
  const defaults = createDefaultTimeline();
  const draft = getObjectDraft(storedDraft);

  return {
    ...defaults,
    ...draft,
    milestones: Array.isArray(draft.milestones)
      ? draft.milestones.map((milestone) => ({
          phase: '',
          description: '',
          dueDate: '',
          status: 'Pending',
          ...(milestone && typeof milestone === 'object' ? milestone : {}),
        }))
      : defaults.milestones,
  };
}

function createLeadSheetState(storedDraft) {
  const defaults = createDefaultLeadSheet();
  const draft = getObjectDraft(storedDraft);

  return {
    ...defaults,
    ...draft,
    leads: Array.isArray(draft.leads)
      ? draft.leads.map((lead) => ({
          name: '',
          phone: '',
          address: '',
          status: '',
          contactDate: '',
          notes: '',
          ...(lead && typeof lead === 'object' ? lead : {}),
        }))
      : defaults.leads,
  };
}

function createQRCardState(storedDraft) {
  return {
    ...createDefaultQRCard(),
    ...getObjectDraft(storedDraft),
  };
}

export function BusinessDataProvider({
  children,
  initialCompanyProfileState,
  onCompanyProfileChange,
  skipInitialProfileSync = false,
  storageNamespace = 'guest',
}) {
  const [companyProfileState, setCompanyProfileState] = useState(() =>
    initialCompanyProfileState
      ? normalizeCompanyProfileState(initialCompanyProfileState)
      : readStoredCompanyProfile(storageNamespace)
  );
  const [storedDocumentDrafts] = useState(() => readStoredDocumentDrafts(storageNamespace));
  const [invoice, setInvoice] = useState(() => createInvoiceState(companyProfileState.company, storedDocumentDrafts.invoice));
  const [agreement, setAgreement] = useState(() => createAgreementState(storedDocumentDrafts.agreement));
  const [scope, setScope] = useState(() => createScopeState(storedDocumentDrafts.scope));
  const [timeline, setTimeline] = useState(() => createTimelineState(storedDocumentDrafts.timeline));
  const [leadSheet, setLeadSheet] = useState(() => createLeadSheetState(storedDocumentDrafts.leadSheet));
  const [qrCard, setQRCard] = useState(() => createQRCardState(storedDocumentDrafts.qrCard));
  const [documentDraftSavedAt, setDocumentDraftSavedAt] = useState(null);
  const skipNextProfileSyncRef = useRef(skipInitialProfileSync);

  useEffect(() => {
    writeStoredCompanyProfile(companyProfileState, storageNamespace);
    if (skipNextProfileSyncRef.current) {
      skipNextProfileSyncRef.current = false;
      return undefined;
    }
    if (!onCompanyProfileChange) return undefined;

    const syncTimer = window.setTimeout(() => {
      onCompanyProfileChange(companyProfileState);
    }, 700);

    return () => window.clearTimeout(syncTimer);
  }, [companyProfileState, onCompanyProfileChange, storageNamespace]);

  useEffect(() => {
    const bankDetails = getBankDetailsFromCompany(companyProfileState.company);
    setInvoice((prev) => ({ ...prev, ...bankDetails }));
  }, [
    companyProfileState.company.bankAccountName,
    companyProfileState.company.bankName,
    companyProfileState.company.bankAccountNumber,
    companyProfileState.company.bankIfscCode,
    companyProfileState.company.bankBranch,
  ]);

  useEffect(() => {
    const saveDocumentDrafts = () => {
      writeStoredDocumentDrafts(
        {
          invoice,
          agreement,
          scope,
          timeline,
          leadSheet,
          qrCard,
        },
        storageNamespace
      );
      setDocumentDraftSavedAt(new Date().toISOString());
    };

    const draftSaveTimer = window.setTimeout(saveDocumentDrafts, 500);
    window.addEventListener('pagehide', saveDocumentDrafts);
    window.addEventListener('beforeunload', saveDocumentDrafts);

    return () => {
      window.clearTimeout(draftSaveTimer);
      window.removeEventListener('pagehide', saveDocumentDrafts);
      window.removeEventListener('beforeunload', saveDocumentDrafts);
    };
  }, [agreement, invoice, leadSheet, qrCard, scope, storageNamespace, timeline]);

  const company = companyProfileState.company;
  const isCompanyProfileLocked = companyProfileState.isLocked;
  const companyProfileUpdatedAt = companyProfileState.updatedAt;

  const updateCompany = (updates) => {
    setCompanyProfileState((prev) => ({
      ...prev,
      company: normalizeCompanyProfile({ ...prev.company, ...updates }),
      updatedAt: new Date().toISOString(),
    }));
  };
  const replaceCompany = (nextCompany) => {
    setCompanyProfileState((prev) => ({
      ...prev,
      company: normalizeCompanyProfile(nextCompany),
      updatedAt: new Date().toISOString(),
    }));
  };
  const lockCompanyProfile = () => {
    setCompanyProfileState((prev) => ({
      ...prev,
      company: normalizeCompanyProfile({ ...prev.company, bankDetailsLocked: true }),
      isLocked: true,
      updatedAt: new Date().toISOString(),
    }));
  };
  const unlockCompanyProfile = () => {
    setCompanyProfileState((prev) => ({
      ...prev,
      company: normalizeCompanyProfile({ ...prev.company, bankDetailsLocked: false }),
      isLocked: false,
      updatedAt: prev.updatedAt || new Date().toISOString(),
    }));
  };
  const resetCompanyProfile = () => {
    setCompanyProfileState((prev) => ({
      company: {
        ...defaultCompany,
        workspaceMode: prev.company.workspaceMode,
        businessSubMode: prev.company.businessSubMode,
      },
      isLocked: false,
      updatedAt: null,
    }));
  };
  const hydrateCompanyProfileState = (profileState) => {
    skipNextProfileSyncRef.current = true;
    setCompanyProfileState(normalizeCompanyProfileState(profileState));
  };
  const updateInvoice = (updates) => setInvoice((prev) => ({ ...prev, ...updates }));
  const updateAgreement = (updates) => setAgreement((prev) => ({ ...prev, ...updates }));
  const updateScope = (updates) => setScope((prev) => ({ ...prev, ...updates }));
  const updateTimeline = (updates) => setTimeline((prev) => ({ ...prev, ...updates }));
  const updateLeadSheet = (updates) => setLeadSheet((prev) => ({ ...prev, ...updates }));
  const updateQRCard = (updates) => setQRCard((prev) => ({ ...prev, ...updates }));

  const value = {
    company,
    isCompanyProfileLocked,
    companyProfileUpdatedAt,
    invoice,
    agreement,
    scope,
    timeline,
    leadSheet,
    qrCard,
    documentDraftSavedAt,
    updateCompany,
    replaceCompany,
    lockCompanyProfile,
    unlockCompanyProfile,
    resetCompanyProfile,
    hydrateCompanyProfileState,
    updateInvoice,
    updateAgreement,
    updateScope,
    updateTimeline,
    updateLeadSheet,
    updateQRCard,
  };

  return (
    <BusinessDataContext.Provider value={value}>
      {children}
    </BusinessDataContext.Provider>
  );
}

export function useBusinessData() {
  const ctx = useContext(BusinessDataContext);
  if (!ctx) throw new Error('useBusinessData must be used within BusinessDataProvider');
  return ctx;
}
