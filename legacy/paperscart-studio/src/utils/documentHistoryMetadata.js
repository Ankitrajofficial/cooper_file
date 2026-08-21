import { getInvoiceTotals } from './invoiceMath';

function cleanHistoryKeyPart(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildHistoryKey(parts) {
  return parts.map(cleanHistoryKeyPart).filter(Boolean).join('|');
}

export function getDocumentDataByType(docType, documents) {
  switch (docType) {
    case 'invoice':
      return documents.invoice;
    case 'agreement':
      return documents.agreement;
    case 'scope':
      return documents.scope;
    case 'timeline':
      return documents.timeline;
    case 'leadsheet':
      return documents.leadSheet;
    case 'qrcard':
      return documents.qrCard;
    case 'shippinglabel':
    case 'templates':
      return documents.invoice;
    default:
      return null;
  }
}

export function getDocumentHistoryMeta(docType, data) {
  if (!data) return {};
  if (docType === 'invoice') {
    const { total: amount } = getInvoiceTotals(data);
    return {
      clientName: data.clientName || '',
      status: data.status || '',
      amount,
      date: data.date || '',
    };
  }
  if (docType === 'agreement') {
    return {
      projectName: data.projectName || '',
      clientName: data.clientName || '',
      date: data.date || '',
    };
  }
  if (docType === 'scope') {
    return {
      projectName: data.projectName || '',
      clientName: data.clientName || '',
      date: data.date || '',
    };
  }
  if (docType === 'timeline') {
    return {
      projectName: data.projectName || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
    };
  }
  if (docType === 'leadsheet') {
    return {
      stateOperatingHead: data.stateOperatingHead || '',
      leadCount: (data.leads || []).length,
      firstLead: (data.leads && data.leads[0] && data.leads[0].name) || '',
    };
  }
  if (docType === 'qrcard') {
    return {
      hostelName: data.hostelName || '',
      purpose: data.purpose || '',
      stateOperatingHead: data.stateOperatingHead || '',
    };
  }
  if (docType === 'shippinglabel') {
    return {
      clientName: data.clientName || '',
      clientPhone: data.clientPhone || '',
      invoiceNumber: data.invoiceNumber || '',
    };
  }
  if (docType === 'templates') {
    return {
      invoiceLabel: data.invoiceLabel || '',
      invoiceTemplate: data.invoiceTemplate || '',
    };
  }
  return {};
}

export function getDocumentHistoryDuplicateKey(docType, data) {
  if (!data) return '';

  if (docType === 'invoice') {
    const { total } = getInvoiceTotals(data);
    return buildHistoryKey([
      'invoice',
      data.invoiceNumber || data.date,
      data.clientName,
      data.date,
      Number.isFinite(total) ? total.toFixed(2) : '',
    ]);
  }

  if (docType === 'agreement') {
    return buildHistoryKey([
      'agreement',
      data.agreementNumber || data.projectName,
      data.projectName,
      data.clientName,
      data.date,
    ]);
  }

  if (docType === 'scope') {
    return buildHistoryKey([
      'scope',
      data.scopeNumber || data.projectName,
      data.projectName,
      data.clientName,
      data.date,
    ]);
  }

  if (docType === 'timeline') {
    return buildHistoryKey([
      'timeline',
      data.projectName,
      data.clientName,
      data.startDate,
      data.endDate,
    ]);
  }

  return '';
}

export function getDocumentHistoryLabel(docType, data) {
  if (!data) return 'Untitled';
  switch (docType) {
    case 'invoice':
      return `Invoice ${data.invoiceNumber || '-'}`;
    case 'agreement':
      return `Agreement ${data.agreementNumber || '-'} - ${data.projectName || '-'}`;
    case 'scope':
      return `Scope ${data.scopeNumber || '-'} - ${data.projectName || '-'}`;
    case 'timeline':
      return `Timeline: ${data.projectName || '-'}`;
    case 'leadsheet':
      return `Lead sheet (${(data.leads || []).length} leads)`;
    case 'qrcard':
      return `QR Card ${data.hostelName || data.purpose || 'Business'}`;
    case 'shippinglabel':
      return `Shipping label ${data.clientName || data.invoiceNumber || 'Customer'}`;
    case 'templates':
      return `Template ${data.invoiceLabel || 'Invoice'} - ${data.invoiceTemplate || 'clean'}`;
    default:
      return 'Saved document';
  }
}
