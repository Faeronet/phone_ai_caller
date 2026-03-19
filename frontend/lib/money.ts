const centsToUnits = (amountCents: number) => amountCents / 100;

const bynFormatter = new Intl.NumberFormat("be-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0
});

export function formatByn(amountCents: number) {
  return bynFormatter.format(centsToUnits(amountCents));
}

// Backward-compatible alias for existing imports.
export function formatRub(amountCents: number) {
  return formatByn(amountCents);
}

export function rubToCentsFromInput(value: string) {
  // Accept "1990", "1990.50", "1 990,50"
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

