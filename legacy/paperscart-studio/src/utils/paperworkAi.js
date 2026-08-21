import { getApiBase } from './apiConfig';
import { getStoredToken } from './authClient';

export async function generatePaperworkDraft({ answers, context }) {
  const token = getStoredToken();
  if (!token) throw new Error('You are signed out. Sign in again to use AI drafting.');

  let response;
  try {
    response = await fetch(`${getApiBase()}/api/paperwork/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers, context }),
    });
  } catch {
    throw new Error('Could not reach the AI service. Check that the backend is running.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `AI drafting failed (${response.status}).`);
  }
  if (!payload?.draft) {
    throw new Error('The AI service did not return a draft.');
  }
  return payload;
}
