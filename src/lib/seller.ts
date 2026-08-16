import { supabase } from './supabase';
import type { Seller } from './types';

const SELLER_KEY = 'campus_connect_seller_id';
const SELLER_INFO_KEY = 'campus_connect_seller_info';

export function getSellerId(): string | null {
  return localStorage.getItem(SELLER_KEY);
}

export function getSellerInfo(): { name: string; whatsapp: string } | null {
  const raw = localStorage.getItem(SELLER_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSellerInfo(name: string, whatsapp: string) {
  localStorage.setItem(SELLER_INFO_KEY, JSON.stringify({ name, whatsapp }));
}

export async function ensureSeller(name: string, whatsapp: string): Promise<Seller> {
  const existingId = getSellerId();

  if (existingId) {
    const { data } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', existingId)
      .maybeSingle();
    if (data) {
      if (data.name !== name || data.whatsapp !== whatsapp) {
        const { data: updated } = await supabase
          .from('sellers')
          .update({ name, whatsapp })
          .eq('id', existingId)
          .select('*')
          .maybeSingle();
        if (updated) {
          setSellerInfo(name, whatsapp);
          return updated;
        }
      }
      setSellerInfo(name, whatsapp);
      return data;
    }
  }

  const { data, error } = await supabase
    .from('sellers')
    .insert({ name, whatsapp })
    .select('*')
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create seller profile');
  }

  localStorage.setItem(SELLER_KEY, data.id);
  setSellerInfo(name, whatsapp);
  return data;
}
