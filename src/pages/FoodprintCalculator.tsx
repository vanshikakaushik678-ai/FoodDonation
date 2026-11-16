import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, UtensilsCrossed, Trash2, Cloud, Info } from 'lucide-react';
import { DONATION_CATEGORIES, UNITS } from '@/lib/types';
import { estimateFoodprint, FOODPRINT } from '@/lib/utils';

export default function FoodprintCalculator() {
  const [quantity, setQuantity] = useState('40');
  const [unit, setUnit] = useState<string>('servings');

  const result = useMemo(() => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return null;
    return estimateFoodprint(qty, unit);
  }, [quantity, unit]);

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="text-center">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700">
          Foodprint Calculator
        </span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          What's your foodprint?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Enter an amount of food to see roughly how many meals it could
          support, how much waste stays out of landfill, and the emissions
          avoided.
        </p>
      </div>

      <div className="card mt-8 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="qty" className="label">Food quantity</label>
            <input
              id="qty"
              type="number"
              min="0"
              step="any"
              className="input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 40"
            />
          </div>
          <div>
            <label htmlFor="unit" className="label">Unit</label>
            <select id="unit" className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {result ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-primary-50 p-6 text-center">
              <UtensilsCrossed className="mx-auto h-7 w-7 text-primary-600" />
              <p className="mt-2 font-display text-3xl font-bold text-primary-800">~{result.meals}</p>
              <p className="text-sm text-primary-700">meals supported (approx.)</p>
            </div>
            <div className="rounded-2xl bg-accent-50 p-6 text-center">
              <Trash2 className="mx-auto h-7 w-7 text-accent-600" />
              <p className="mt-2 font-display text-3xl font-bold text-accent-700">≈ {result.kg} kg</p>
              <p className="text-sm text-accent-700">food waste avoided (approx.)</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-6 text-center">
              <Cloud className="mx-auto h-7 w-7 text-blue-600" />
              <p className="mt-2 font-display text-3xl font-bold text-blue-700">≈ {result.co2} kg</p>
              <p className="text-sm text-blue-700">CO₂e emissions avoided (approx.)</p>
            </div>
          </div>
        ) : (
          <p className="mt-8 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Enter a valid quantity to see your estimate.
          </p>
        )}

        <div className="mt-8 flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>All figures are approximate estimates.</strong> They assume{' '}
            {FOODPRINT.kgPerServing} kg per serving of cooked food, standard
            portion weights for other units, and about {FOODPRINT.co2PerKgFood} kg
            CO₂e avoided per kilogram of food kept out of landfill. Actual
            impact depends on food type, packaging and distribution.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Ready to turn the estimate into real meals?
          </p>
          <Link to="/donate" className="btn-primary text-sm">
            <Calculator className="h-4 w-4" /> Donate food now
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Categories you can donate: {DONATION_CATEGORIES.join(' · ')}
      </p>
    </div>
  );
}
