export type UserRole = 'donor' | 'ngo';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  city: string | null;
  created_at: string;
}

export type DonationStatus = 'pending' | 'accepted' | 'picked_up' | 'completed' | 'rejected';

export interface Donation {
  id: string;
  donor_id: string | null;
  food_name: string;
  category: string;
  quantity: number;
  unit: string;
  description: string | null;
  image_url: string | null;
  pickup_address: string;
  lat: number;
  lng: number;
  available_from: string | null;
  available_until: string | null;
  status: DonationStatus;
  accepted_by: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Ngo {
  id: string;
  user_id: string | null;
  org_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}

export const DONATION_CATEGORIES = [
  'Cooked Meals',
  'Fruits & Vegetables',
  'Bakery',
  'Packaged',
  'Dairy',
  'Beverages',
] as const;

export const FOOD_CATEGORIES = DONATION_CATEGORIES;

export const STATUS_STYLES: Record<DonationStatus, { label: string; badge: string; dot: string }> = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  accepted: { label: 'Accepted', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  picked_up: { label: 'Picked Up', badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  completed: { label: 'Completed', badge: 'bg-primary-100 text-primary-800', dot: 'bg-primary-500' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export const UNITS = ['servings', 'kg', 'items', 'packets', 'litres'] as const;
