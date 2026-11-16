import { type Donation } from './types';

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'Not set';
  return new Date(dateStr).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Foodprint estimation model (all values are approximations).
 * - 1 serving of cooked food ~= 0.35 kg (FAO/WRI rough guidance for meal portions)
 * - 1 meal supported per serving of cooked food; lighter categories scaled
 * - avoided waste = total weight of food kept out of landfill
 * - CO2e avoided ~= 2.5 kg per kg of food waste (waste-to-landfill emissions factors)
 */
export const FOODPRINT = {
  kgPerServing: 0.35,
  kgPerUnit: { servings: 0.35, kg: 1, items: 0.1, packets: 0.08, litres: 1.03 } as Record<string, number>,
  mealsPerServing: 1,
  co2PerKgFood: 2.5,
};

export function estimateFoodprint(quantity: number, unit: string) {
  const kgPerUnit = FOODPRINT.kgPerUnit[unit] ?? FOODPRINT.kgPerServing;
  const kg = quantity * kgPerUnit;
  const meals = Math.round(unit === 'servings' ? quantity : kg / FOODPRINT.kgPerServing);
  const co2 = Math.round(kg * FOODPRINT.co2PerKgFood * 10) / 10;
  return { kg: Math.round(kg * 10) / 10, meals: Math.max(meals, 0), co2 };
}

export interface FoodprintTotals {
  totalDonations: number;
  pending: number;
  completed: number;
  totalQuantity: number;
  meals: number;
  kgFood: number;
  co2: number;
}

export function aggregateFoodprint(donations: Donation[]): FoodprintTotals {
  const active = donations.filter((d) => d.status !== 'rejected');
  let meals = 0;
  let kgFood = 0;
  for (const d of active) {
    const est = estimateFoodprint(d.quantity, d.unit);
    meals += est.meals;
    kgFood += est.kg;
  }
  return {
    totalDonations: active.length,
    pending: donations.filter((d) => d.status === 'pending' || d.status === 'accepted').length,
    completed: donations.filter((d) => d.status === 'completed').length,
    totalQuantity: active.reduce((sum, d) => sum + d.quantity, 0),
    meals,
    kgFood: Math.round(kgFood * 10) / 10,
    co2: Math.round(kgFood * FOODPRINT.co2PerKgFood * 10) / 10,
  };
}

export const SAMPLE_TAG = /(\(Sample\))$/;

export function isSample(name: string): boolean {
  return SAMPLE_TAG.test(name);
}
