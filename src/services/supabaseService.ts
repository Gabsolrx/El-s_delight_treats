import { createClient } from '@supabase/supabase-js';
import { supabase, getSupabaseClient, isSupabaseReady, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../lib/supabase';
import {
  StoredOrder,
  CustomCakeInquiry,
  OrderStatus,
  ReviewItem,
  Product,
  CategoryItem,
  BusinessInfo,
  SiteContent,
} from '../types';
import { PRODUCTS } from '../data/products';
import { INITIAL_DEMO_ORDERS, INITIAL_DEMO_INQUIRIES } from '../data/defaultAdminData';

function isMissingColumnError(msg?: string): boolean {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes('column') ||
    lower.includes('does not exist') ||
    lower.includes('schema cache') ||
    lower.includes('could not find the')
  );
}

function extractMissingColumn(msg?: string): string | null {
  if (!msg) return null;
  const patterns = [
    /Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i,
    /Could not find the column ['"]?([a-zA-Z0-9_]+)['"]?/i,
    /column ['"]?([a-zA-Z0-9_]+)['"]? (?:of relation [^\s]+ )?does not exist/i,
    /column [^\s\.]+\.['"]?([a-zA-Z0-9_]+)['"]? does not exist/i,
    /column ['"]?([a-zA-Z0-9_]+)['"]? does not exist/i,
    /['"]?([a-zA-Z0-9_]+)['"]? column .* schema cache/i,
  ];
  for (const p of patterns) {
    const m = msg.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

const CORE_PRODUCT_KEYS = [
  'id', 'name', 'slug', 'category', 'price', 'old_price', 'discount',
  'description', 'full_description', 'images', 'flavours', 'sizes', 'occasion',
  'bestseller', 'featured', 'is_new', 'in_stock', 'rating', 'review_count',
  'budget_range', 'preparation_time', 'tag', 'created_at', 'updated_at'
];

const CORE_ORDER_KEYS = [
  'id', 'customer_name', 'customer_phone', 'customer_email',
  'delivery_type', 'delivery_address', 'items', 'total', 'status', 'created_at'
];

const CORE_INQUIRY_KEYS = [
  'id', 'full_name', 'phone', 'occasion', 'status', 'created_at'
];

const CORE_CATEGORY_KEYS = ['name', 'label', 'count', 'image', 'slug'];

const CORE_REVIEW_KEYS = ['id', 'name', 'rating', 'text', 'created_at'];

const CORE_SETTINGS_KEYS = ['id', 'name', 'phone', 'whatsapp_number', 'email', 'address'];

const CORE_SITE_CONTENT_KEYS = ['id', 'hero', 'announcements', 'brand_promises', 'about'];

/**
 * Resiliently upsert a single row into a table with dynamic missing column stripping & fallback
 */
async function resilientUpsertRow(
  tableName: string,
  initialRow: Record<string, any>,
  conflictKey: string = 'id',
  coreAllowedKeys?: string[]
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient() || supabase;
  if (!client) return { success: false, error: 'Supabase client not initialized' };

  let currentRow = { ...initialRow };
  const strippedCols = new Set<string>();

  for (let attempt = 0; attempt < 14; attempt++) {
    // 1. Try standard upsert first
    const { error: upsertErr } = await client.from(tableName).upsert([currentRow], { onConflict: conflictKey });
    if (!upsertErr) {
      return { success: true };
    }

    // 2. Check if a column doesn't exist in the remote schema
    const missingCol = extractMissingColumn(upsertErr.message);
    if (missingCol && missingCol in currentRow && !strippedCols.has(missingCol)) {
      strippedCols.add(missingCol);
      delete currentRow[missingCol];
      continue;
    }

    // 3. Handle JSON vs TEXT type mismatch
    if (
      upsertErr.message?.includes('type text') ||
      upsertErr.message?.includes('cannot cast type jsonb to text') ||
      upsertErr.message?.includes('cannot cast type text to jsonb') ||
      upsertErr.message?.includes('invalid input syntax for type json')
    ) {
      let modified = false;
      for (const k of Object.keys(currentRow)) {
        if (typeof currentRow[k] === 'object' && currentRow[k] !== null && !Array.isArray(currentRow[k])) {
          currentRow[k] = JSON.stringify(currentRow[k]);
          modified = true;
        } else if (Array.isArray(currentRow[k])) {
          currentRow[k] = JSON.stringify(currentRow[k]);
          modified = true;
        }
      }
      if (modified) continue;
    }

    // 4. Try existence check and explicit UPDATE or INSERT
    try {
      const { data: existingRecord } = await client
        .from(tableName)
        .select(conflictKey)
        .eq(conflictKey, currentRow[conflictKey])
        .maybeSingle();

      if (existingRecord) {
        const updRes = await client
          .from(tableName)
          .update(currentRow)
          .eq(conflictKey, currentRow[conflictKey]);
        if (!updRes.error) return { success: true };

        const updMissingCol = extractMissingColumn(updRes.error?.message);
        if (updMissingCol && updMissingCol in currentRow && !strippedCols.has(updMissingCol)) {
          strippedCols.add(updMissingCol);
          delete currentRow[updMissingCol];
          continue;
        }
      } else {
        const insRes = await client.from(tableName).insert([currentRow]);
        if (!insRes.error) return { success: true };

        if (
          insRes.error.code === '23505' ||
          insRes.error.message?.includes('duplicate key') ||
          insRes.error.message?.includes('already exists')
        ) {
          const updRes = await client
            .from(tableName)
            .update(currentRow)
            .eq(conflictKey, currentRow[conflictKey]);
          if (!updRes.error) return { success: true };

          if (tableName === 'products' && currentRow.slug) {
            const slugUpd = await client
              .from('products')
              .update(currentRow)
              .eq('slug', currentRow.slug);
            if (!slugUpd.error) return { success: true };
          }
        }

        const insMissingCol = extractMissingColumn(insRes.error?.message);
        if (insMissingCol && insMissingCol in currentRow && !strippedCols.has(insMissingCol)) {
          strippedCols.add(insMissingCol);
          delete currentRow[insMissingCol];
          continue;
        }
      }
    } catch {
      // ignore check error and proceed to fallbacks
    }

    // 5. If RLS violation, give clear actionable instruction
    if (
      upsertErr.message?.includes('row-level security') ||
      upsertErr.message?.includes('policy') ||
      upsertErr.code === '42501'
    ) {
      return {
        success: false,
        error: `Supabase RLS policy restricted write on table "${tableName}". Run the database SQL schema in your Supabase SQL editor to enable write permissions.`,
      };
    }

    // 6. Strip down to minimal coreAllowedKeys if still failing on missing column
    if (isMissingColumnError(upsertErr.message) && coreAllowedKeys && coreAllowedKeys.length > 0) {
      const coreRow: Record<string, any> = {};
      for (const k of coreAllowedKeys) {
        if (k in currentRow && !strippedCols.has(k)) {
          coreRow[k] = currentRow[k];
        }
      }
      if (Object.keys(coreRow).length < Object.keys(currentRow).length) {
        currentRow = coreRow;
        continue;
      }
    }

    return { success: false, error: upsertErr.message };
  }

  return { success: false, error: 'Maximum retry attempts exceeded' };
}

/**
 * Resiliently upsert a batch of rows into a table with fallback to item-by-item upsert
 */
async function resilientUpsertBatch(
  tableName: string,
  rows: Record<string, any>[],
  conflictKey: string = 'id',
  coreAllowedKeys?: string[]
): Promise<{ success: boolean; savedCount: number; error?: string }> {
  const client = getSupabaseClient() || supabase;
  if (!client || rows.length === 0) {
    return { success: rows.length === 0, savedCount: 0, error: !client ? 'Supabase not configured' : undefined };
  }

  let batchRows = rows.map((r) => ({ ...r }));
  const strippedCols = new Set<string>();
  let batchSuccess = false;

  for (let attempt = 0; attempt < 8; attempt++) {
    const { error } = await client.from(tableName).upsert(batchRows, { onConflict: conflictKey });
    if (!error) {
      batchSuccess = true;
      break;
    }

    const missingCol = extractMissingColumn(error.message);
    if (missingCol && !strippedCols.has(missingCol)) {
      strippedCols.add(missingCol);
      batchRows = batchRows.map((r) => {
        const copy = { ...r };
        delete copy[missingCol];
        return copy;
      });
      continue;
    }

    if (
      error.message?.includes('type text') ||
      error.message?.includes('cannot cast type jsonb to text') ||
      error.message?.includes('cannot cast type text to jsonb') ||
      error.message?.includes('invalid input syntax for type json')
    ) {
      batchRows = batchRows.map((r) => {
        const copy = { ...r };
        for (const k of Object.keys(copy)) {
          if (typeof copy[k] === 'object' && copy[k] !== null) {
            copy[k] = JSON.stringify(copy[k]);
          }
        }
        return copy;
      });
      continue;
    }

    break;
  }

  if (batchSuccess) {
    return { success: true, savedCount: rows.length };
  }

  // Row-by-row fallback: ensure every valid item succeeds individually
  let savedCount = 0;
  let lastError: string | undefined;

  for (const row of batchRows) {
    const res = await resilientUpsertRow(tableName, row, conflictKey, coreAllowedKeys);
    if (res.success) {
      savedCount++;
    } else {
      lastError = res.error;
    }
  }

  return {
    success: savedCount > 0,
    savedCount,
    error: savedCount < rows.length ? lastError : undefined,
  };
}

export const supabaseService = {
  getClient() {
    return getSupabaseClient() || supabase;
  },

  isAvailable(): boolean {
    return isSupabaseReady() && (getSupabaseClient() !== null || supabase !== null);
  },

  // ============================================================================
  // 1. ORDERS MANAGEMENT
  // ============================================================================

  mapOrderToRow(order: StoredOrder): Record<string, any> {
    const cust: any = order.customer || (order as any).customer || {};
    return {
      id: order.orderId || (order as any).id,
      customer_name: cust.fullName || cust.name || cust.customer_name || 'Customer',
      customer_phone: cust.phone || cust.customer_phone || '',
      customer_email: cust.email || cust.customer_email || null,
      delivery_type: cust.fulfillmentType || cust.deliveryType || cust.delivery_type || 'delivery',
      delivery_method: cust.deliveryMethod || cust.delivery_method || null,
      delivery_address: cust.address || cust.delivery_address || null,
      delivery_area: cust.area || cust.delivery_area || null,
      landmark: cust.landmark || null,
      delivery_date: cust.deliveryDate || cust.delivery_date || null,
      delivery_time: cust.deliveryTime || cust.delivery_time || 'Morning (9am - 1pm)',
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      delivery_fee: Number(order.deliveryFee) || Number((order as any).delivery_fee) || 0,
      discount: Number((order as any).discount) || 0,
      total: Number(order.total) || 0,
      payment_method: (order as any).paymentMethod || (order as any).payment_method || 'transfer',
      payment_status: (order as any).paymentStatus || (order as any).payment_status || (order.status === 'completed' || order.status === 'out_for_delivery' || order.status === 'baking' ? 'confirmed' : 'pending'),
      payment_reference: (order as any).paymentReference || (order as any).payment_reference || null,
      order_notes: cust.specialInstructions || (order as any).order_notes || null,
      admin_notes: order.adminNotes || (order as any).admin_notes || null,
      status: order.status || 'pending_payment_verification',
      created_at: order.createdAt || (order as any).created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Save or update an order to Supabase
   */
  async saveOrder(order: StoredOrder): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const row = this.mapOrderToRow(order);
      return await resilientUpsertRow('orders', row, 'id', CORE_ORDER_KEYS);
    } catch (err: any) {
      console.warn('Supabase saveOrder exception:', err);
      return { success: false, error: err?.message || 'Failed to save order' };
    }
  },

  /**
   * Save all dashboard orders to Supabase in batches with fallback
   */
  async saveAllOrders(orders: StoredOrder[]): Promise<{ success: boolean; savedCount: number; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { success: false, savedCount: 0, error: 'Supabase not configured' };
    }

    const effectiveOrders = orders.length > 0 ? orders : INITIAL_DEMO_ORDERS;

    try {
      const rows = effectiveOrders.map((o) => this.mapOrderToRow(o));
      return await resilientUpsertBatch('orders', rows, 'id', CORE_ORDER_KEYS);
    } catch (err: any) {
      console.warn('Supabase saveAllOrders exception:', err);
      return { success: false, savedCount: 0, error: err?.message || 'Failed to save orders' };
    }
  },

  /**
   * Fetch all orders from Supabase (for admin syncing)
   */
  async getOrders(): Promise<{ orders: StoredOrder[]; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { orders: [], error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { orders: [], error: error.message };
      }

      const orders: StoredOrder[] = (data || []).map((row) => {
        let items = row.items || [];
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch {
            items = [];
          }
        }
        return {
          orderId: row.id,
          createdAt: row.created_at || new Date().toISOString(),
          items: Array.isArray(items) ? items : [],
          customer: {
            fullName: row.customer_name || 'Customer',
            phone: row.customer_phone || '',
            email: row.customer_email || '',
            fulfillmentType: row.delivery_type === 'pickup' ? 'pickup' : 'delivery',
            deliveryMethod: row.delivery_method || undefined,
            area: row.delivery_area || '',
            address: row.delivery_address || '',
            landmark: row.landmark || '',
            deliveryDate: row.delivery_date || '',
            deliveryTime: row.delivery_time || 'Morning (9am - 1pm)',
            specialInstructions: row.order_notes || '',
          },
          subtotal: Number(row.subtotal) || 0,
          deliveryFee: Number(row.delivery_fee) || 0,
          total: Number(row.total) || 0,
          status: (row.status || 'pending_payment_verification') as OrderStatus,
          adminNotes: row.admin_notes || undefined,
        };
      });

      return { orders };
    } catch (err: any) {
      return { orders: [], error: err?.message };
    }
  },

  /**
   * Update order status in Supabase
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, adminNotes?: string): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const payload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (adminNotes !== undefined) payload.admin_notes = adminNotes;

      let { error } = await supabase.from('orders').update(payload).eq('id', orderId);
      if (error && isMissingColumnError(error.message)) {
        delete payload.admin_notes;
        const retry = await supabase.from('orders').update(payload).eq('id', orderId);
        error = retry.error;
      }
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Delete order permanently from Supabase
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    const client = this.getClient();
    if (!this.isAvailable() || !client || !orderId) return false;
    try {
      const { error } = await client.from('orders').delete().eq('id', orderId);
      if (error) {
        console.warn('Supabase deleteOrder error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteOrder exception:', e);
      return false;
    }
  },

  /**
   * Delete multiple orders by ID from Supabase
   */
  async deleteOrders(orderIds: string[]): Promise<boolean> {
    const client = this.getClient();
    if (!this.isAvailable() || !client || !orderIds || orderIds.length === 0) return false;
    try {
      const { error } = await client.from('orders').delete().in('id', orderIds);
      return !error;
    } catch {
      return false;
    }
  },

  // ============================================================================
  // 2. CUSTOM CAKE INQUIRIES MANAGEMENT
  // ============================================================================

  mapInquiryToRow(inquiry: CustomCakeInquiry): Record<string, any> {
    const d: any = (inquiry as any).data || inquiry;
    return {
      id: inquiry.id,
      full_name: d.fullName || d.full_name || 'Consultation Client',
      phone: d.phone || '',
      email: d.email || null,
      occasion: d.occasion || 'Celebration',
      tiers: parseInt(String(d.tiers || 1), 10) || 1,
      cake_size: d.cakeSize || d.cake_size || '',
      flavour: d.flavour || '',
      colour_theme: d.colourTheme || d.colour_theme || '',
      theme_description: d.themeDescription || d.theme_description || '',
      cake_message: d.cakeMessage || d.cake_message || null,
      budget_range: d.budgetRange || d.budget_range || '',
      preferred_date: d.preferredDate || d.preferred_date || '',
      delivery_type: d.deliveryType || d.delivery_type || 'delivery',
      delivery_method: d.deliveryMethod || d.delivery_method || null,
      delivery_area: d.deliveryArea || d.delivery_area || '',
      reference_url: d.referenceUrl || d.reference_url || null,
      special_instructions: d.specialInstructions || d.special_instructions || null,
      admin_notes: inquiry.adminNotes || (inquiry as any).admin_notes || null,
      status: inquiry.status || (inquiry as any).status || 'new',
      created_at: inquiry.createdAt || (inquiry as any).created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async saveInquiry(inquiry: CustomCakeInquiry): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const row = this.mapInquiryToRow(inquiry);
      return await resilientUpsertRow('inquiries', row, 'id', CORE_INQUIRY_KEYS);
    } catch (err: any) {
      console.warn('Supabase saveInquiry exception:', err);
      return { success: false, error: err?.message || 'Failed to save inquiry' };
    }
  },

  async saveAllInquiries(inquiries: CustomCakeInquiry[]): Promise<{ success: boolean; savedCount: number; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { success: false, savedCount: 0, error: 'Supabase not configured' };
    }

    const effectiveInquiries = inquiries.length > 0 ? inquiries : INITIAL_DEMO_INQUIRIES;

    try {
      const rows = effectiveInquiries.map((i) => this.mapInquiryToRow(i));
      return await resilientUpsertBatch('inquiries', rows, 'id', CORE_INQUIRY_KEYS);
    } catch (err: any) {
      console.warn('Supabase saveAllInquiries exception:', err);
      return { success: false, savedCount: 0, error: err?.message || 'Failed to save inquiries' };
    }
  },

  async getInquiries(): Promise<{ inquiries: CustomCakeInquiry[]; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { inquiries: [], error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { inquiries: [], error: error.message };
      }

      const inquiries: CustomCakeInquiry[] = (data || []).map((row) => ({
        id: row.id,
        createdAt: row.created_at || new Date().toISOString(),
        status: (row.status || 'new') as CustomCakeInquiry['status'],
        adminNotes: row.admin_notes || undefined,
        data: {
          fullName: row.full_name || '',
          phone: row.phone || '',
          email: row.email || '',
          occasion: row.occasion || '',
          cakeSize: row.cake_size || '',
          flavour: row.flavour || '',
          colourTheme: row.colour_theme || '',
          themeDescription: row.theme_description || '',
          tiers: String(row.tiers || 1),
          cakeMessage: row.cake_message || '',
          budgetRange: row.budget_range || '',
          preferredDate: row.preferred_date || '',
          deliveryType: row.delivery_type === 'pickup' ? 'pickup' : 'delivery',
          deliveryMethod: row.delivery_method || undefined,
          deliveryArea: row.delivery_area || '',
          specialInstructions: row.special_instructions || '',
          referenceUrl: row.reference_url || '',
        },
      }));

      return { inquiries };
    } catch (err: any) {
      return { inquiries: [], error: err?.message };
    }
  },

  async updateInquiryStatus(id: string, status: CustomCakeInquiry['status'], adminNotes?: string): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const payload: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (adminNotes !== undefined) payload.admin_notes = adminNotes;
      let { error } = await supabase.from('inquiries').update(payload).eq('id', id);
      if (error && isMissingColumnError(error.message)) {
        delete payload.admin_notes;
        const retry = await supabase.from('inquiries').update(payload).eq('id', id);
        error = retry.error;
      }
      return !error;
    } catch {
      return false;
    }
  },

  async deleteInquiry(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!this.isAvailable() || !client || !id) return false;
    try {
      const { error } = await client.from('inquiries').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteInquiries(ids: string[]): Promise<boolean> {
    const client = this.getClient();
    if (!this.isAvailable() || !client || !ids || ids.length === 0) return false;
    try {
      const { error } = await client.from('inquiries').delete().in('id', ids);
      return !error;
    } catch {
      return false;
    }
  },

  // ============================================================================
  // 3. PRODUCTS CATALOG MANAGEMENT (ALL 18 PRODUCTS)
  // ============================================================================

  mapProductToRow(p: Product): Record<string, any> {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: p.category,
      price: Number(p.price) || 0,
      old_price: p.oldPrice ? Number(p.oldPrice) : null,
      discount: p.discount ? Number(p.discount) : null,
      description: p.description || '',
      full_description: p.fullDescription || p.description || '',
      images: p.images || [],
      flavours: p.flavours || [],
      sizes: p.sizes || [],
      occasion: p.occasion || [],
      bestseller: p.bestseller ?? false,
      featured: p.featured ?? false,
      is_new: p.isNew ?? false,
      in_stock: true,
      rating: p.rating ?? 5.0,
      review_count: p.reviewCount ?? 0,
      budget_range: p.budgetRange || null,
      preparation_time: p.preparationTime || '24 hours notice',
      tag: p.tag || null,
      updated_at: new Date().toISOString(),
    };
  },

  mapRowToProduct(row: any): Product {
    const parseJson = (val: any, fallback: any = []) => {
      if (!val) return fallback;
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      }
      return fallback;
    };

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      price: Number(row.price) || 0,
      oldPrice: row.old_price ? Number(row.old_price) : undefined,
      discount: row.discount ? Number(row.discount) : undefined,
      description: row.description || '',
      fullDescription: row.full_description || row.description || '',
      images: parseJson(row.images, []),
      flavours: parseJson(row.flavours, []),
      sizes: parseJson(row.sizes, []),
      occasion: parseJson(row.occasion, []),
      bestseller: Boolean(row.bestseller),
      featured: Boolean(row.featured),
      isNew: Boolean(row.is_new),
      rating: Number(row.rating) || 5.0,
      reviewCount: Number(row.review_count) || 0,
      budgetRange: row.budget_range || 'Under ₦20,000',
      preparationTime: row.preparation_time || '24 hours notice',
      tag: row.tag || undefined,
    };
  },

  async saveProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!this.isAvailable() || !client) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const row = this.mapProductToRow(product);
      if (!row.images || !Array.isArray(row.images) || row.images.length === 0) {
        row.images = ['/assets/sister-nk-cake.svg'];
      }

      // 1. Resilient upsert attempt
      const upsertRes = await resilientUpsertRow('products', row, 'id', CORE_PRODUCT_KEYS);
      if (upsertRes.success) {
        return { success: true };
      }

      // 2. Direct insert fallback
      const insRes = await client.from('products').insert([row]);
      if (!insRes.error) {
        return { success: true };
      }

      // 3. Direct update fallback (if record already exists)
      const updRes = await client.from('products').update(row).eq('id', row.id);
      if (!updRes.error) {
        return { success: true };
      }

      console.warn('Supabase saveProduct failed all fallbacks:', upsertRes.error, insRes.error, updRes.error);
      return { success: false, error: insRes.error?.message || upsertRes.error || 'Failed to save product' };
    } catch (err: any) {
      console.warn('Supabase saveProduct exception:', err);
      return { success: false, error: err?.message || 'Failed to save product' };
    }
  },

  async saveAllProducts(products: Product[]): Promise<{ success: boolean; savedCount: number; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { success: false, savedCount: 0, error: 'Supabase not configured' };
    }

    try {
      // Ensure all 18 catalog products from PRODUCTS are included in the upload
      const existingIds = new Set(products.map((p) => p.id));
      const missingCatalog = PRODUCTS.filter((p) => !existingIds.has(p.id));
      const combined = [...products, ...missingCatalog];

      const seenIds = new Set<string>();
      const finalProducts: Product[] = [];

      for (const p of combined) {
        if (seenIds.has(p.id)) continue;
        seenIds.add(p.id);
        const safeImages = (p.images && p.images.length > 0) ? p.images : ['/assets/sister-nk-cake.svg'];
        finalProducts.push({
          ...p,
          images: safeImages,
        });
      }

      const rows = finalProducts.map((p) => this.mapProductToRow(p));
      return await resilientUpsertBatch('products', rows, 'id', CORE_PRODUCT_KEYS);
    } catch (err: any) {
      console.warn('Supabase saveAllProducts exception:', err);
      return { success: false, savedCount: 0, error: err?.message || 'Failed to save products' };
    }
  },

  async getProducts(): Promise<{ products: Product[]; error?: string }> {
    if (!this.isAvailable() || !supabase) {
      return { products: [], error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        return { products: [], error: error.message };
      }

      const products: Product[] = (data || []).map((row) => this.mapRowToProduct(row));
      return { products };
    } catch (err: any) {
      return { products: [], error: err?.message };
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!this.isAvailable() || !client || !id) return false;
    try {
      const { error } = await client.from('products').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteProducts(ids: string[]): Promise<boolean> {
    const client = this.getClient();
    if (!this.isAvailable() || !client || !ids || ids.length === 0) return false;
    try {
      const { error } = await client.from('products').delete().in('id', ids);
      return !error;
    } catch {
      return false;
    }
  },

  // ============================================================================
  // 4. CATEGORIES MANAGEMENT
  // ============================================================================

  async saveCategory(category: CategoryItem): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const row = {
        name: category.name,
        label: category.label || '',
        count: category.count || '',
        image: category.image || '',
        slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        updated_at: new Date().toISOString(),
      };
      const res = await resilientUpsertRow('categories', row, 'name', CORE_CATEGORY_KEYS);
      return res.success;
    } catch {
      return false;
    }
  },

  async saveAllCategories(categories: CategoryItem[]): Promise<boolean> {
    if (!this.isAvailable() || !supabase || categories.length === 0) return false;
    try {
      const rows = categories.map((c) => ({
        name: c.name,
        label: c.label || '',
        count: c.count || '',
        image: c.image || '',
        slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        updated_at: new Date().toISOString(),
      }));
      const res = await resilientUpsertBatch('categories', rows, 'name', CORE_CATEGORY_KEYS);
      return res.success;
    } catch {
      return false;
    }
  },

  async getCategories(): Promise<CategoryItem[] | null> {
    if (!this.isAvailable() || !supabase) return null;
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((r) => ({
        name: r.name,
        label: r.label,
        count: r.count,
        image: r.image,
        slug: r.slug,
      }));
    } catch {
      return null;
    }
  },

  async deleteCategory(categoryName: string): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const { error } = await supabase.from('categories').delete().eq('name', categoryName);
      return !error;
    } catch {
      return false;
    }
  },

  // ============================================================================
  // 5. STORE & BRAND SETTINGS (BUSINESS INFO)
  // ============================================================================

  async saveBusinessSettings(info?: BusinessInfo, adminPin?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const safeInfo: any = info || {};
      const payload: Record<string, any> = {
        id: 'primary',
        name: safeInfo.name || "El's Delight Treats",
        tagline: safeInfo.tagline || 'Baked with Love in Lagos',
        type: safeInfo.type || 'Bakery & Confectionery',
        phone: safeInfo.phone || '08085449779',
        whatsapp_number: safeInfo.whatsappNumber || '08085449779',
        whatsapp_url_number: safeInfo.whatsappUrlNumber || '2348085449779',
        email: safeInfo.email || 'info@elsdelight.com',
        instagram: safeInfo.instagram || 'els_delighttreats',
        instagram_url: safeInfo.instagramUrl || 'https://www.instagram.com/els_delighttreats',
        facebook: safeInfo.facebook || "El's Delight",
        facebook_url: safeInfo.facebookUrl || 'https://facebook.com/elsdelight',
        address: safeInfo.address || 'Lagos, Nigeria',
        pickup_note: safeInfo.pickupNote || '',
        opening_hours: safeInfo.openingHours || 'Mon - Sat: 8:00 AM - 6:00 PM',
        bank_name: safeInfo.payment?.bank || 'Stanbic IBTC',
        account_name: safeInfo.payment?.accountName || 'Chinazor Adaora Arinze',
        account_number: safeInfo.payment?.accountNumber || '0086485307',
        logo_settings: safeInfo.logo || {},
        delivery_settings: {
          deliveryFeeFlat: safeInfo.deliveryFeeFlat ?? 2500,
          freeDeliveryThreshold: safeInfo.freeDeliveryThreshold ?? 50000,
          deliveryPolicyNotice: safeInfo.deliveryPolicyNotice || 'Cakes are packaged in rigid protective boxes and hand-delivered.',
          deliveryMethods: safeInfo.deliveryMethods || [],
        },
        updated_at: new Date().toISOString(),
      };

      if (adminPin) {
        payload.admin_pin = adminPin;
      }

      return await resilientUpsertRow('business_settings', payload, 'id', CORE_SETTINGS_KEYS);
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save business settings' };
    }
  },

  async getBusinessSettings(): Promise<{ info: Partial<BusinessInfo> | null; adminPin?: string }> {
    if (!this.isAvailable() || !supabase) return { info: null };
    try {
      const { data, error } = await supabase.from('business_settings').select('*').eq('id', 'primary').single();
      if (error || !data) return { info: null };

      const info: Partial<BusinessInfo> = {
        name: data.name,
        tagline: data.tagline,
        type: data.type,
        phone: data.phone,
        whatsappNumber: data.whatsapp_number,
        whatsappUrlNumber: data.whatsapp_url_number,
        email: data.email,
        instagram: data.instagram,
        instagramUrl: data.instagram_url,
        facebook: data.facebook,
        facebookUrl: data.facebook_url,
        address: data.address,
        pickupNote: data.pickup_note,
        openingHours: data.opening_hours,
        payment: {
          bank: data.bank_name || 'Stanbic IBTC',
          accountName: data.account_name || 'Chinazor Adaora Arinze',
          accountNumber: data.account_number || '0086485307',
        },
        logo: data.logo_settings || undefined,
        deliveryFeeFlat: data.delivery_settings?.deliveryFeeFlat,
        freeDeliveryThreshold: data.delivery_settings?.freeDeliveryThreshold,
        deliveryPolicyNotice: data.delivery_settings?.deliveryPolicyNotice,
        deliveryMethods: data.delivery_settings?.deliveryMethods,
      };

      return { info, adminPin: data.admin_pin || undefined };
    } catch {
      return { info: null };
    }
  },

  // ============================================================================
  // 6. SITE CONTENT & CMS MANAGEMENT
  // ============================================================================

  async saveSiteContent(content?: SiteContent): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const safeContent: any = content || {};
      const payload: Record<string, any> = {
        id: 'primary',
        hero: safeContent.hero || {},
        announcements: safeContent.announcements || [],
        brand_promises: safeContent.brandPromises || [],
        about: safeContent.about || {},
        faqs: safeContent.faqs || [],
        corporate: safeContent.corporate || {},
        occasions_section: safeContent.occasionsSection || {},
        sweet_moments: safeContent.sweetMoments || {},
        budget_section: safeContent.budgetSection || {},
        updated_at: new Date().toISOString(),
      };

      return await resilientUpsertRow('site_content', payload, 'id', CORE_SITE_CONTENT_KEYS);
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save site content' };
    }
  },

  async getSiteContent(): Promise<SiteContent | null> {
    if (!this.isAvailable() || !supabase) return null;
    try {
      const { data, error } = await supabase.from('site_content').select('*').eq('id', 'primary').single();
      if (error || !data) return null;

      return {
        hero: data.hero || {},
        announcements: data.announcements || [],
        brandPromises: data.brand_promises || [],
        about: data.about || {},
        faqs: data.faqs || [],
        corporate: data.corporate || {},
        occasionsSection: data.occasions_section || undefined,
        sweetMoments: data.sweet_moments || undefined,
        budgetSection: data.budget_section || undefined,
      };
    } catch {
      return null;
    }
  },

  // ============================================================================
  // 7. REVIEWS & TESTIMONIALS MANAGEMENT
  // ============================================================================

  async saveReview(review: ReviewItem): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const row = {
        id: review.id,
        name: review.name,
        location: review.location || null,
        occasion: review.occasion || null,
        rating: review.rating || 5,
        date: review.date || 'Verified Order',
        text: review.text,
        product_name: review.productName || null,
        verified: review.verified ?? true,
      };
      const res = await resilientUpsertRow('reviews', row, 'id', CORE_REVIEW_KEYS);
      return res.success;
    } catch {
      return false;
    }
  },

  async saveAllReviews(reviews: ReviewItem[]): Promise<boolean> {
    if (!this.isAvailable() || !supabase || reviews.length === 0) return false;
    try {
      const rows = reviews.map((r) => ({
        id: r.id,
        name: r.name,
        location: r.location || null,
        occasion: r.occasion || null,
        rating: r.rating || 5,
        date: r.date || 'Verified Order',
        text: r.text,
        product_name: r.productName || null,
        verified: r.verified ?? true,
      }));
      const res = await resilientUpsertBatch('reviews', rows, 'id', CORE_REVIEW_KEYS);
      return res.success;
    } catch {
      return false;
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!this.isAvailable() || !client || !id) return false;
    try {
      const { error } = await client.from('reviews').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async getReviews(): Promise<ReviewItem[] | null> {
    if (!this.isAvailable() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return null;

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        location: row.location || '',
        occasion: row.occasion || '',
        rating: row.rating || 5,
        date: row.date || 'Verified Order',
        text: row.text,
        productName: row.product_name || '',
        verified: row.verified ?? true,
      }));
    } catch {
      return null;
    }
  },

  // ============================================================================
  // 8. COMPLETE STORE DATA SYNC (ALL WEBSITE ASPECTS TO SUPABASE)
  // ============================================================================

  /**
   * Saves ALL 18 products, live orders, custom inquiries, categories, reviews,
   * business settings and website CMS content to Supabase in one unified call.
   */
  async saveAllWebsiteData(params: {
    products: Product[];
    orders: StoredOrder[];
    inquiries: CustomCakeInquiry[];
    categories: CategoryItem[];
    reviews: ReviewItem[];
    businessInfo: BusinessInfo;
    siteContent: SiteContent;
    adminPin?: string;
  }): Promise<{
    success: boolean;
    savedProducts: number;
    savedOrders: number;
    savedInquiries: number;
    savedCategories: number;
    savedReviews: number;
    savedSettings: boolean;
    savedContent: boolean;
    error?: string;
  }> {
    if (!this.isAvailable() || !supabase) {
      return {
        success: false,
        savedProducts: 0,
        savedOrders: 0,
        savedInquiries: 0,
        savedCategories: 0,
        savedReviews: 0,
        savedSettings: false,
        savedContent: false,
        error: 'Supabase not configured',
      };
    }

    try {
      // Execute each table sync individually so partial tables still save successfully
      const [prodRes, orderRes, inqRes, catRes, revRes, setRes, cmsRes] = await Promise.allSettled([
        this.saveAllProducts(params.products),
        this.saveAllOrders(params.orders),
        this.saveAllInquiries(params.inquiries),
        this.saveAllCategories(params.categories),
        this.saveAllReviews(params.reviews),
        this.saveBusinessSettings(params.businessInfo, params.adminPin),
        this.saveSiteContent(params.siteContent),
      ]);

      const savedProducts = prodRes.status === 'fulfilled' ? prodRes.value.savedCount : 0;
      const savedOrders = orderRes.status === 'fulfilled' ? orderRes.value.savedCount : 0;
      const savedInquiries = inqRes.status === 'fulfilled' ? inqRes.value.savedCount : 0;
      const savedCategories = catRes.status === 'fulfilled' && catRes.value ? params.categories.length : 0;
      const savedReviews = revRes.status === 'fulfilled' && revRes.value ? params.reviews.length : 0;
      const savedSettings = setRes.status === 'fulfilled' ? Boolean(setRes.value.success) : false;
      const savedContent = cmsRes.status === 'fulfilled' ? Boolean(cmsRes.value.success) : false;

      const errors: string[] = [];
      if (prodRes.status === 'rejected') errors.push(`Products: ${prodRes.reason?.message}`);
      else if (!prodRes.value.success && prodRes.value.error) errors.push(`Products: ${prodRes.value.error}`);

      if (orderRes.status === 'rejected') errors.push(`Orders: ${orderRes.reason?.message}`);
      else if (!orderRes.value.success && orderRes.value.error) errors.push(`Orders: ${orderRes.value.error}`);

      if (inqRes.status === 'rejected') errors.push(`Inquiries: ${inqRes.reason?.message}`);
      else if (!inqRes.value.success && inqRes.value.error) errors.push(`Inquiries: ${inqRes.value.error}`);

      if (catRes.status === 'rejected') errors.push(`Categories: ${catRes.reason?.message}`);
      if (revRes.status === 'rejected') errors.push(`Reviews: ${revRes.reason?.message}`);

      if (setRes.status === 'rejected') errors.push(`Settings: ${setRes.reason?.message}`);
      else if (!setRes.value.success && setRes.value.error) errors.push(`Settings: ${setRes.value.error}`);

      if (cmsRes.status === 'rejected') errors.push(`Site Content: ${cmsRes.reason?.message}`);
      else if (!cmsRes.value.success && cmsRes.value.error) errors.push(`Site Content: ${cmsRes.value.error}`);

      const anySaved =
        savedProducts > 0 ||
        savedOrders > 0 ||
        savedInquiries > 0 ||
        savedCategories > 0 ||
        savedReviews > 0 ||
        savedSettings ||
        savedContent;

      return {
        success: anySaved,
        savedProducts,
        savedOrders,
        savedInquiries,
        savedCategories,
        savedReviews,
        savedSettings,
        savedContent,
        error: errors.length > 0 ? errors.join(', ') : undefined,
      };
    } catch (err: any) {
      console.warn('Supabase saveAllWebsiteData exception:', err);
      return {
        success: false,
        savedProducts: 0,
        savedOrders: 0,
        savedInquiries: 0,
        savedCategories: 0,
        savedReviews: 0,
        savedSettings: false,
        savedContent: false,
        error: err?.message || 'Failed full database sync',
      };
    }
  },

  // ============================================================================
  // 9. DATABASE PURGE: REMOVE ALL DELETED DATA & OLD IMAGES FROM SUPABASE
  // ============================================================================

  async purgeDeletedDataFromSupabase(params: {
    activeProductIds: string[];
    deletedOrderIds: string[];
    deletedInquiryIds: string[];
    deletedProductIds: string[];
  }): Promise<{
    success: boolean;
    purgedOrders: number;
    purgedInquiries: number;
    purgedProducts: number;
    error?: string;
  }> {
    if (!this.isAvailable() || !supabase) {
      return { success: false, purgedOrders: 0, purgedInquiries: 0, purgedProducts: 0, error: 'Supabase not configured' };
    }

    let purgedOrders = 0;
    let purgedInquiries = 0;
    let purgedProducts = 0;

    try {
      // 1. Purge deleted orders
      if (params.deletedOrderIds.length > 0) {
        const { error } = await supabase.from('orders').delete().in('id', params.deletedOrderIds);
        if (!error) purgedOrders = params.deletedOrderIds.length;
      }

      // 2. Purge deleted inquiries
      if (params.deletedInquiryIds.length > 0) {
        const { error } = await supabase.from('inquiries').delete().in('id', params.deletedInquiryIds);
        if (!error) purgedInquiries = params.deletedInquiryIds.length;
      }

      // 3. Purge deleted custom products (safeguard all 18 catalog products so they are never purged)
      const CATALOG_IDS = new Set(PRODUCTS.map((p) => p.id));
      const safeProductIdsToDelete = params.deletedProductIds.filter((id) => !CATALOG_IDS.has(id));
      if (safeProductIdsToDelete.length > 0) {
        const { error } = await supabase.from('products').delete().in('id', safeProductIdsToDelete);
        if (!error) purgedProducts = safeProductIdsToDelete.length;
      }

      return {
        success: true,
        purgedOrders,
        purgedInquiries,
        purgedProducts,
      };
    } catch (err: any) {
      return {
        success: false,
        purgedOrders,
        purgedInquiries,
        purgedProducts,
        error: err?.message,
      };
    }
  },

  // ============================================================================
  // 10. REAL-TIME SUPABASE LIVE TABLE INSPECTOR & ROW COUNT VERIFIER
  // ============================================================================

  async getTableLiveCounts(): Promise<{
    isConfigured: boolean;
    products: number | null;
    orders: number | null;
    inquiries: number | null;
    categories: number | null;
    reviews: number | null;
    businessSettings: number | null;
    siteContent: number | null;
    errors?: Record<string, string>;
  }> {
    const client = this.getClient();
    if (!this.isAvailable() || !client) {
      return {
        isConfigured: false,
        products: null,
        orders: null,
        inquiries: null,
        categories: null,
        reviews: null,
        businessSettings: null,
        siteContent: null,
      };
    }

    const counts: Record<string, number | null> = {
      products: null,
      orders: null,
      inquiries: null,
      categories: null,
      reviews: null,
      businessSettings: null,
      siteContent: null,
    };
    const errors: Record<string, string> = {};

    const tableDefs = [
      { key: 'products', name: 'products' },
      { key: 'orders', name: 'orders' },
      { key: 'inquiries', name: 'inquiries' },
      { key: 'categories', name: 'categories' },
      { key: 'reviews', name: 'reviews' },
      { key: 'businessSettings', name: 'business_settings' },
      { key: 'siteContent', name: 'site_content' },
    ];

    await Promise.allSettled(
      tableDefs.map(async ({ key, name }) => {
        try {
          const { count, error } = await client
            .from(name)
            .select('*', { count: 'exact', head: true });
          if (error) {
            errors[key] = error.message;
            counts[key] = null;
          } else {
            counts[key] = count ?? 0;
          }
        } catch (e: any) {
          errors[key] = e?.message || 'Error';
          counts[key] = null;
        }
      })
    );

    return {
      isConfigured: true,
      products: counts.products,
      orders: counts.orders,
      inquiries: counts.inquiries,
      categories: counts.categories,
      reviews: counts.reviews,
      businessSettings: counts.businessSettings,
      siteContent: counts.siteContent,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  },
};
