import { getSession } from './auth.js';
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function validToken(token) {
  const session = await getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');
  return session.access_token || token;
}

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    let detail = `Request failed (HTTP ${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') detail = body.detail;
    } catch { /* Keep the HTTP message when the response is not JSON. */ }
    throw new Error(detail);
  }
  return response.json();
}

export async function predictSymptoms(symptoms, accessToken) {
  const token = await validToken(accessToken);
  return request('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ symptoms }),
  });
}

export async function fetchPredictionHistory(accessToken) {
  const token = await validToken(accessToken);
  return request('/history', { headers: { Authorization: `Bearer ${token}` } });
}

export function sendHealthChat(message, history = []) {
  return request('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
}

export function searchNearbyCare(locationRequest) {
  return request('/nearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(locationRequest),
  });
}
