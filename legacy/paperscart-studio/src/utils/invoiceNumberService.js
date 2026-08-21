import { getApiBase, getStoredToken } from './authClient';

function compactDate(issueDate) {
  return String(issueDate || '').replace(/-/g, '');
}

export function createLocalInvoiceNumber(issueDate) {
  return `INV-${compactDate(issueDate)}-100`;
}

export async function getNextInvoiceNumber(issueDate) {
  if (!issueDate) {
    throw new Error('Issue date is required before generating an invoice number.');
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error('Sign in to generate sequential invoice numbers.');
  }

  const response = await fetch(`${getApiBase()}/api/profile/invoice-number`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ issueDate }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Invoice number request failed (${response.status}).`);
  }
  if (!payload?.invoiceNumber || typeof payload.invoiceNumber !== 'string') {
    throw new Error('The server did not return an invoice number.');
  }

  return payload.invoiceNumber;
}
