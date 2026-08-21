import { normalizePdfThemeId } from './pdfThemes';

export const COMPANY_PROFILE_FIELDS = [
  { key: 'companyName', label: 'Company Name', placeholder: 'Acme Creative Studio', required: true },
  { key: 'founderName', label: 'Founder / Contact Name', placeholder: 'John Doe', required: true },
  { key: 'address', label: 'Address', placeholder: '123 Business Street, New Delhi', required: true },
  { key: 'mobileNumber', label: 'Mobile Number', placeholder: '+91 98765 43210', required: true },
  { key: 'upiId', label: 'UPI ID (for payment QR)', placeholder: 'johndoe@okicici' },
];

export const WORKSPACE_MODE_OPTIONS = [
  {
    id: 'freelance',
    label: 'Freelancing mode',
    description: 'Onboard a client once, then reuse their details in invoices, agreements, and scope of work.',
  },
  {
    id: 'business',
    label: 'Startup / business mode',
    description: 'Create product cards, bill customers quickly, and prepare paperless invoices for email.',
  },
  {
    id: 'agency',
    label: 'Agency mode',
    description: 'Coming soon for teams, retainers, campaigns, and multi-client pipelines.',
    comingSoon: true,
  },
];

export const DEPLOYED_WORKSPACE_MODES = ['freelance'];

export function getSelectableWorkspaceModeOptions() {
  return WORKSPACE_MODE_OPTIONS.filter(
    (option) => !option.comingSoon && DEPLOYED_WORKSPACE_MODES.includes(option.id)
  );
}

export const BUSINESS_DOCUMENT_OPTIONS = [
  { value: '', label: 'Select document type' },
  { value: 'msme', label: 'MSME' },
  { value: 'gst', label: 'GST' },
  { value: 'pan', label: 'PAN' },
  { value: 'cin', label: 'CIN' },
  { value: 'fssai', label: 'FSSAI' },
  { value: 'other', label: 'Other business document' },
];

export function createEmptyCompanyProfile() {
  return {
    companyName: '',
    founderName: '',
    businessDocumentType: '',
    businessDocumentCustomLabel: '',
    businessDocumentValue: '',
    address: '',
    mobileNumber: '',
    logoDataUrl: '',
    upiId: '',
    bankAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankBranch: '',
    bankDetailsLocked: false,
    pdfTheme: 'slate',
    workspaceMode: '',
    businessSubMode: 'shop',
    activeFreelanceClientId: '',
    activeBusinessProductId: '',
    freelanceClients: [],
    businessProducts: [],
    historyAutoSaveOnDownload: true,
    historyAvoidDuplicateDownloads: true,
  };
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanDataUrl(value) {
  const cleaned = cleanString(value);
  return cleaned.startsWith('data:image/') ? cleaned : '';
}

function normalizeFreelanceClients(clients) {
  if (!Array.isArray(clients)) return [];

  return clients
    .map((client) => {
      const source = client && typeof client === 'object' ? client : {};
      const id = cleanString(source.id);
      const name = cleanString(source.name || source.clientName);
      const address = cleanAddressText(source.address || source.clientAddress);

      return {
        id,
        name,
        contactName: cleanString(source.contactName),
        email: cleanString(source.email),
        phone: cleanString(source.phone),
        address,
        projectName: cleanString(source.projectName),
        scope: cleanString(source.scope),
        deliverables: cleanString(source.deliverables),
        paymentTerms: cleanString(source.paymentTerms),
        notes: cleanString(source.notes),
        createdAt: cleanString(source.createdAt),
        updatedAt: cleanString(source.updatedAt),
      };
    })
    .filter((client) => client.id && (client.name || client.contactName || client.email || client.phone || client.address));
}

function normalizeBusinessProducts(products) {
  if (!Array.isArray(products)) return [];

  return products
    .map((product) => {
      const source = product && typeof product === 'object' ? product : {};
      const id = cleanString(source.id);
      const price = Number(source.price);
      const stockQuantity = Number(source.stockQuantity ?? source.availableQuantity ?? 0);

      return {
        id,
        name: cleanString(source.name),
        sku: cleanString(source.sku),
        description: cleanString(source.description),
        imageDataUrl: cleanDataUrl(source.imageDataUrl),
        price: Number.isFinite(price) && price > 0 ? price : 0,
        stockQuantity: Number.isFinite(stockQuantity) && stockQuantity > 0 ? Math.floor(stockQuantity) : 0,
        unit: cleanString(source.unit) || 'pieces',
        createdAt: cleanString(source.createdAt),
        updatedAt: cleanString(source.updatedAt),
      };
    })
    .filter((product) => product.id && (product.name || product.description || product.sku));
}

export function normalizeWorkspaceMode(mode) {
  const cleaned = cleanString(mode);
  const option = WORKSPACE_MODE_OPTIONS.find((item) => item.id === cleaned);
  return option?.id || '';
}

export function normalizeDeployableWorkspaceMode(mode) {
  const normalizedMode = normalizeWorkspaceMode(mode);
  return DEPLOYED_WORKSPACE_MODES.includes(normalizedMode) ? normalizedMode : 'freelance';
}

function normalizeBusinessSubMode(mode) {
  return cleanString(mode) === 'delivery' ? 'delivery' : 'shop';
}

export function cleanAddressText(address) {
  return cleanString(address)
    .replace(/\s*['`´‘’]\s*(?=\d{5,6}\b)/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getAddressLines(address, maxLineLength = 42) {
  const cleaned = cleanAddressText(address);
  if (!cleaned) return [];

  const explicitLines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return explicitLines.flatMap((line) => {
    const parts = line.split(',').map((part, index, list) => {
      const text = part.trim();
      return index < list.length - 1 ? `${text},` : text;
    });
    const lines = [];
    let current = '';

    parts.forEach((part) => {
      const next = current ? `${current} ${part}` : part;
      if (current && next.length > maxLineLength) {
        lines.push(current);
        current = part;
      } else {
        current = next;
      }
    });

    if (current) lines.push(current);
    return lines;
  });
}

export function normalizeCompanyProfile(company) {
  const base = createEmptyCompanyProfile();
  const source = company && typeof company === 'object' ? company : {};
  const legacyBusinessDocumentValue = cleanString(source.msmeNumber);
  const businessDocumentType = cleanString(
    source.businessDocumentType ?? (legacyBusinessDocumentValue ? 'msme' : base.businessDocumentType)
  );

  return {
    companyName: cleanString(source.companyName ?? base.companyName),
    founderName: cleanString(source.founderName ?? base.founderName),
    businessDocumentType,
    businessDocumentCustomLabel: cleanString(source.businessDocumentCustomLabel ?? base.businessDocumentCustomLabel),
    businessDocumentValue: cleanString(source.businessDocumentValue ?? legacyBusinessDocumentValue ?? base.businessDocumentValue),
    address: cleanAddressText(source.address ?? base.address),
    mobileNumber: cleanString(source.mobileNumber ?? base.mobileNumber),
    logoDataUrl: cleanDataUrl(source.logoDataUrl ?? base.logoDataUrl),
    upiId: cleanString(source.upiId ?? base.upiId),
    bankAccountName: cleanString(source.bankAccountName ?? base.bankAccountName),
    bankName: cleanString(source.bankName ?? base.bankName),
    bankAccountNumber: cleanString(source.bankAccountNumber ?? base.bankAccountNumber),
    bankIfscCode: cleanString(source.bankIfscCode ?? base.bankIfscCode),
    bankBranch: cleanString(source.bankBranch ?? base.bankBranch),
    bankDetailsLocked: Boolean(source.bankDetailsLocked),
    pdfTheme: normalizePdfThemeId(source.pdfTheme ?? base.pdfTheme),
    workspaceMode: normalizeWorkspaceMode(source.workspaceMode ?? base.workspaceMode),
    businessSubMode: normalizeBusinessSubMode(source.businessSubMode ?? base.businessSubMode),
    activeFreelanceClientId: cleanString(source.activeFreelanceClientId ?? base.activeFreelanceClientId),
    activeBusinessProductId: cleanString(source.activeBusinessProductId ?? base.activeBusinessProductId),
    freelanceClients: normalizeFreelanceClients(source.freelanceClients),
    businessProducts: normalizeBusinessProducts(source.businessProducts),
    historyAutoSaveOnDownload: source.historyAutoSaveOnDownload !== false,
    historyAvoidDuplicateDownloads: source.historyAvoidDuplicateDownloads !== false,
  };
}

export function getBusinessDocumentLabel(type, customLabel = '') {
  const normalizedType = cleanString(type);
  const normalizedCustomLabel = cleanString(customLabel);

  if (normalizedType === 'other') {
    return normalizedCustomLabel || 'Business Document';
  }

  const match = BUSINESS_DOCUMENT_OPTIONS.find((option) => option.value === normalizedType);
  return match?.label || 'Business Document';
}

export function getBusinessDocumentPlaceholder(type) {
  switch (cleanString(type)) {
    case 'msme':
      return 'Enter MSME number';
    case 'gst':
      return 'Enter GST number';
    case 'pan':
      return 'Enter PAN number';
    case 'cin':
      return 'Enter CIN number';
    case 'fssai':
      return 'Enter FSSAI license number';
    case 'other':
      return 'Enter document number';
    default:
      return 'Select a document type first';
  }
}

export function getCompanyDisplayProfile(company) {
  const normalized = normalizeCompanyProfile(company);

  return {
    companyName: normalized.companyName || 'Your Company Name',
    founderName: normalized.founderName || 'John Doe',
    businessDocumentLabel: getBusinessDocumentLabel(
      normalized.businessDocumentType,
      normalized.businessDocumentCustomLabel
    ),
    businessDocumentValue: normalized.businessDocumentValue,
    address: normalized.address || 'Business Address',
    mobileNumber: normalized.mobileNumber || '+91 98765 43210',
    logoDataUrl: normalized.logoDataUrl,
    upiId: normalized.upiId,
  };
}

export function getCompanyProfileCompletion(company) {
  const normalized = normalizeCompanyProfile(company);
  const missingFields = COMPANY_PROFILE_FIELDS.filter((field) => field.required && !normalized[field.key]);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}
