import { supabase } from '@/lib/supabase';

/**
 * Authenticated fetch wrapper that automatically attaches Supabase JWT Bearer token
 * to all outgoing requests to backend endpoints.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const options: RequestInit = init ? { ...init } : {};
  const headers = new Headers(options.headers || {});

  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (err) {
    console.warn('Failed to retrieve Supabase session token for API request:', err);
  }

  options.headers = headers;
  return fetch(input, options);
}
