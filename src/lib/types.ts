export interface Seller {
  id: string;
  name: string;
  whatsapp: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  image_url: string | null;
  status: string;
  created_at: string;
  seller?: Seller;
}

export interface SellerRating {
  id: string;
  seller_id: string;
  reviewer_name: string;
  ease_rating: number;
  bargaining_rating: number;
  quality_rating: number;
  honesty_rating: number;
  item_quality_rating: number;
  comment: string | null;
  created_at: string;
}

export interface LostFoundPost {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  status: string;
  contact_name: string;
  contact_number: string;
  created_at: string;
}

export interface TravelCompanion {
  id: string;
  poster_name: string;
  destination: string;
  reason: string;
  travel_date: string | null;
  requirements: string | null;
  contact_name: string;
  contact_number: string;
  created_at: string;
}

export const CATEGORIES = [
  { value: 'clothes', label: 'Clothes', icon: 'Shirt' },
  { value: 'food', label: 'Food & Snacks', icon: 'UtensilsCrossed' },
  { value: 'electronics', label: 'Electronics', icon: 'Laptop' },
  { value: 'books_notes', label: 'Books & Notes', icon: 'BookOpen' },
  { value: 'event_tickets', label: 'Event Tickets', icon: 'Ticket' },
  { value: 'appliances', label: 'Appliances', icon: 'Wind' },
  { value: 'other', label: 'Other', icon: 'Package' },
] as const;

export const CONDITIONS = [
  { value: 'new', label: 'Brand New', color: 'emerald' },
  { value: 'like_new', label: 'Like New', color: 'sky' },
  { value: 'used', label: 'Used', color: 'amber' },
  { value: 'old', label: 'Old', color: 'rose' },
] as const;

export const LF_STATUSES = [
  { value: 'with_me', label: 'With Me', color: 'sky' },
  { value: 'with_authorities', label: 'With College Authorities', color: 'amber' },
  { value: 'returned', label: 'Returned to Owner', color: 'emerald' },
] as const;

export const RATING_CRITERIA = [
  { key: 'ease_rating', label: 'Ease of Deal', hint: 'How smooth was the transaction?' },
  { key: 'bargaining_rating', label: 'Bargaining', hint: 'Fair during negotiation?' },
  { key: 'quality_rating', label: 'Quality', hint: 'Did the item match the description?' },
  { key: 'honesty_rating', label: 'Honesty', hint: 'Transparent about flaws?' },
  { key: 'item_quality_rating', label: 'Item Quality', hint: 'Overall item condition?' },
] as const;
