import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://ucrzlqsohnnyjptlgzle.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcnpscXNvaG5ueWpwdGxnemxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTY5NDAsImV4cCI6MjEwNzAzMjk0MH0.neyvX-emWCt21TpUcWeQp-Hn-9L_qVi1EaDSjsoINFM';

// Safe localStorage access
function getStoredItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {}
  return null;
}

function setStoredItem(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch {}
}

function removeStoredItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {}
}

export function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  return url
    .trim()
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/+$/, '');
}

export function isValidSupabaseUrl(url: string): boolean {
  if (!url) return false;
  const clean = cleanSupabaseUrl(url);
  return (
    clean.startsWith('https://') &&
    clean !== 'https://your-project-id.supabase.co' &&
    clean.length > 15
  );
}

export function isValidSupabaseKey(key: string): boolean {
  if (!key) return false;
  const clean = key.trim();
  return clean !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' && clean.length > 20;
}

export function isSupabaseExplicitlyDisconnected(): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('els_supabase_disconnected') === 'true';
    }
  } catch {}
  return false;
}

export function resolveSupabaseUrl(): string {
  if (isSupabaseExplicitlyDisconnected()) return '';
  const stored = (getStoredItem('els_supabase_url') || '').trim();
  if (stored && isValidSupabaseUrl(stored)) {
    return cleanSupabaseUrl(stored);
  }
  const envUrl = (import.meta.env?.VITE_SUPABASE_URL || '').trim();
  if (envUrl && isValidSupabaseUrl(envUrl)) {
    return cleanSupabaseUrl(envUrl);
  }
  return DEFAULT_SUPABASE_URL;
}

export function resolveSupabaseKey(): string {
  if (isSupabaseExplicitlyDisconnected()) return '';
  const stored = (getStoredItem('els_supabase_anon_key') || '').trim();
  if (stored && isValidSupabaseKey(stored)) {
    return stored;
  }
  const envKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim();
  if (envKey && isValidSupabaseKey(envKey)) {
    return envKey;
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

let activeClient: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();

  if (!url || !key || !isValidSupabaseUrl(url) || !isValidSupabaseKey(key)) {
    activeClient = null;
    currentClientUrl = '';
    currentClientKey = '';
    return null;
  }

  if (activeClient && currentClientUrl === url && currentClientKey === key) {
    return activeClient;
  }

  try {
    activeClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentClientUrl = url;
    currentClientKey = key;
    return activeClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    activeClient = null;
    return null;
  }
}

// Dynamic getter property proxy for seamless backward compatibility with `import { supabase } from '../lib/supabase'`
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      if (typeof prop === 'string' && ['from', 'rpc', 'auth', 'storage'].includes(prop)) {
        return () => ({
          select: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
          insert: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
          update: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
          upsert: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
          delete: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
        });
      }
      return undefined;
    }
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

export function computeIsConfigured(): boolean {
  return getSupabaseClient() !== null;
}

export function isSupabaseReady(): boolean {
  return getSupabaseClient() !== null;
}

export const isSupabaseConfigured = computeIsConfigured();

/**
 * Configure new Supabase credentials directly from the Admin Dashboard
 */
export function setSupabaseCredentials(url: string, anonKey: string): { success: boolean; message: string } {
  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = anonKey.trim();

  if (!cleanUrl.startsWith('https://')) {
    return { success: false, message: 'Supabase URL must start with https:// (e.g. https://your-project-ref.supabase.co)' };
  }
  if (cleanKey.length < 20) {
    return { success: false, message: 'Supabase Anon key must be a valid API token' };
  }

  // Clear disconnection flag and save new account credentials
  setStoredItem('els_supabase_disconnected', 'false');
  setStoredItem('els_supabase_url', cleanUrl);
  setStoredItem('els_supabase_anon_key', cleanKey);

  activeClient = null; // Forces re-instantiation
  getSupabaseClient();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('els_supabase_credentials_updated', {
        detail: { url: cleanUrl, configured: true },
      })
    );
  }

  return { success: true, message: 'Connected to Supabase project! Connection initialized.' };
}

/**
 * Disconnect website from Supabase completely
 */
export function disconnectSupabase(): void {
  removeStoredItem('els_supabase_url');
  removeStoredItem('els_supabase_anon_key');
  setStoredItem('els_supabase_disconnected', 'true');

  activeClient = null;
  currentClientUrl = '';
  currentClientKey = '';

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('els_supabase_credentials_updated', {
        detail: { url: '', configured: false, disconnected: true },
      })
    );
  }
}

/**
 * Alias for disconnectSupabase
 */
export function clearSupabaseCredentials(): void {
  disconnectSupabase();
}

/**
 * Get current configured credentials
 */
export function getSupabaseConfig(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isFromStorage: boolean;
  isDisconnected: boolean;
} {
  const client = getSupabaseClient();
  return {
    url: resolveSupabaseUrl(),
    anonKey: resolveSupabaseKey(),
    isConfigured: client !== null,
    isFromStorage: Boolean(getStoredItem('els_supabase_url')),
    isDisconnected: isSupabaseExplicitlyDisconnected(),
  };
}

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
  connected: boolean;
  message: string;
}

export async function checkSupabaseConnection(testUrl?: string, testKey?: string): Promise<SupabaseConnectionStatus> {
  const urlToUse = testUrl ? cleanSupabaseUrl(testUrl) : resolveSupabaseUrl();
  const keyToUse = testKey ? testKey.trim() : resolveSupabaseKey();

  if (!urlToUse || !keyToUse || !isValidSupabaseUrl(urlToUse) || !isValidSupabaseKey(keyToUse)) {
    return {
      isConfigured: false,
      url: urlToUse || 'Not provided',
      hasAnonKey: Boolean(keyToUse),
      connected: false,
      message: 'Supabase credentials not configured. Please provide a valid Project URL and Anon Key.',
    };
  }

  try {
    const probeClient = createClient(urlToUse, keyToUse);
    // Attempt a probe against products table
    const { error, count } = await probeClient.from('products').select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          isConfigured: true,
          url: urlToUse,
          hasAnonKey: true,
          connected: true,
          message: 'Successfully connected and authenticated with Supabase database.',
        };
      }
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          isConfigured: true,
          url: urlToUse,
          hasAnonKey: true,
          connected: true,
          message: 'Connected to Supabase! (Tables need initialization via schema script).',
        };
      }
      return {
        isConfigured: true,
        url: urlToUse,
        hasAnonKey: true,
        connected: false,
        message: `Connection error: ${error.message}`,
      };
    }

    return {
      isConfigured: true,
      url: urlToUse,
      hasAnonKey: true,
      connected: true,
      message: `Successfully connected! Verified ${count !== null ? `${count} active catalog products` : 'tables'} in Supabase database.`,
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      url: urlToUse,
      hasAnonKey: true,
      connected: false,
      message: err?.message || 'Failed to ping Supabase.',
    };
  }
}
