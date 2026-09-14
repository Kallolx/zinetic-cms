export const CHECK_PRICE = Number(process.env.NEXT_PUBLIC_CHECK_PRICE ?? 15);

export type PricingPlan = {
  id: string;
  label: string;
  checks: number;
  discountPercent: number;
};

// bundle discounts. Always checks * CHECK_PRICE * (1 - discountPercent/100).
export const PRICING_PLANS: PricingPlan[] = [
  { id: "starter", label: "Starter", checks: 10, discountPercent: 30 },
  { id: "growth", label: "Growth", checks: 25, discountPercent: 40 },
  { id: "scale", label: "Scale", checks: 50, discountPercent: 50 },
  { id: "enterprise", label: "Enterprise", checks: 100, discountPercent: 60 },
];

export function getPlanById(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === id);
}

/**
 * faceValue: what the checks would cost at the standard per-check price
 * (this is what gets credited to the wallet, the "bonus" from the
 * discount). price: what's actually charged. perCheck: the effective
 * discounted rate, for display.
 */
export function getPlanPricing(plan: PricingPlan) {
  const faceValue = plan.checks * CHECK_PRICE;
  const price = Math.round(faceValue * (1 - plan.discountPercent / 100) * 100) / 100;
  const perCheck = Math.round((price / plan.checks) * 100) / 100;
  return { faceValue, price, perCheck };
}
