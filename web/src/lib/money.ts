// Money display rules from the backend contract. Commerce lines are the same
// everywhere (house rule 5), so they are built here and nowhere else.

// weekly rent display in cents: Math.round(rent_month_cents * 12 / 52).
export function weeklyCents(rentMonthCents: number): number {
  return Math.round((rentMonthCents * 12) / 52)
}

// cents to a display string: whole dollars stay whole, otherwise two places.
export function dollarString(cents: number): string {
  const d = cents / 100
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`
}

// dual price line for rentable pieces, plain price for buy-only.
export function priceLine(a: {
  rentable: boolean
  rent_month_cents: number
  value_cents: number
}): string {
  if (!a.rentable) return `${dollarString(a.value_cents)}.`
  const wk = dollarString(weeklyCents(a.rent_month_cents))
  return `${wk}/wk. every dollar counts toward the ${dollarString(a.value_cents)} buy.`
}

// "about N weeks of rent knocks half off."
export function halfOffWeeks(valueCents: number, wkCents: number): number {
  return Math.ceil((valueCents * 0.5) / wkCents)
}
