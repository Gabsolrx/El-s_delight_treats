/**
 * Robust storage utilities combining IndexedDB (for large payloads like base64 images)
 * and safe localStorage wrappers that gracefully handle browser QuotaExceededError.
 */

const DB_NAME = 'els_delight_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_keyval';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    } catch (err) {
      dbPromise = null;
      reject(err);
    }
  });

  return dbPromise;
}

/**
 * Retrieve a value from IndexedDB (asynchronous, no 5MB quota limit).
 */
export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  } catch (err) {
    return null;
  }
}

/**
 * Save a value into IndexedDB (asynchronous, suitable for high-res base64 images).
 */
export async function idbSet<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  } catch (err) {
    return false;
  }
}

/**
 * Delete a key from IndexedDB.
 */
export async function idbDelete(key: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  } catch (err) {
    return false;
  }
}

/**
 * Recursively scans any object or array and strips or replaces
 * excessively large base64 data URLs (> 25KB) with lightweight placeholders
 * to keep payloads well under browser localStorage 5MB quota.
 */
export function deepStripBase64(value: any, maxDataUrlLen = 25000): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.startsWith('data:image/') && value.length > maxDataUrlLen) {
      return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepStripBase64(item, maxDataUrlLen));
  }
  if (typeof value === 'object') {
    const copy: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      copy[key] = deepStripBase64(value[key], maxDataUrlLen);
    }
    return copy;
  }
  return value;
}

/**
 * Sanitizes an order object specifically, stripping high-res base64 images
 * from embedded product items so storing orders in localStorage remains tiny (< 5KB).
 */
export function sanitizeOrderForStorage<T = any>(order: T): T {
  if (!order || typeof order !== 'object') return order;
  return deepStripBase64(order, 15000);
}

/**
 * Safely strips large Base64 data URLs from JSON strings to fit inside localStorage
 * while IndexedDB preserves the full-resolution photos.
 */
function stripLargeBase64Payload(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    const stripped = deepStripBase64(parsed, 20000);
    return JSON.stringify(stripped);
  } catch (e) {
    return jsonString;
  }
}

/**
 * Frees up non-critical localStorage items to alleviate quota pressure.
 */
export function freeUpTransientStorage(excludeKey?: string): void {
  try {
    // Clear recent views cache
    if (excludeKey !== 'els_recent') {
      localStorage.removeItem('els_recent');
    }
    // Clear email dispatch logs
    if (excludeKey !== 'els_email_dispatch_log') {
      localStorage.removeItem('els_email_dispatch_log');
    }
    // Clear last order only if that is not what is currently being set
    if (excludeKey !== 'els_last_order') {
      localStorage.removeItem('els_last_order');
    }

    // If orders array in localStorage is very large, keep only the latest 10
    const rawOrders = localStorage.getItem('els_orders');
    if (rawOrders && rawOrders.length > 500000) {
      try {
        const parsed = JSON.parse(rawOrders);
        if (Array.isArray(parsed) && parsed.length > 10) {
          const trimmed = deepStripBase64(parsed.slice(0, 10), 10000);
          localStorage.setItem('els_orders', JSON.stringify(trimmed));
        }
      } catch {}
    }
  } catch (e) {}
}

/**
 * Safe wrapper around localStorage.setItem that NEVER throws QuotaExceededError.
 * Automatically frees transient space and strips heavy base64 strings if quota is reached.
 */
export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    const isQuotaError =
      e?.name === 'QuotaExceededError' ||
      e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e?.code === 22 ||
      e?.code === 1014 ||
      (typeof e?.message === 'string' && e.message.toLowerCase().includes('quota'));

    if (isQuotaError) {
      freeUpTransientStorage(key);

      // Retry once after freeing transient storage
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        // Strip heavy base64 data URLs from ANY JSON payload attempting to be saved
        try {
          const stripped = stripLargeBase64Payload(value);
          localStorage.setItem(key, stripped);
          return true;
        } catch (stripErr) {
          // If still failing and saving orders, keep only the top 5
          if (key === 'els_orders') {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                const mini = deepStripBase64(parsed.slice(0, 5), 5000);
                localStorage.setItem(key, JSON.stringify(mini));
                return true;
              }
            } catch {}
          }
          // Quota exceeded: safeSetItem gracefully fails without throwing
          return false;
        }
      }
    }

    return false;
  }
}

/**
 * Safe wrapper around localStorage.getItem that catches potential security/access exceptions.
 */
export function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/**
 * Safe wrapper around localStorage.removeItem.
 */
export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}
