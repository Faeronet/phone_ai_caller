export function centsToRub(amountCents: number) {
  return amountCents / 100;
}

export function formatRub(amountCents: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(centsToRub(amountCents));
}

export function rubToCentsFromInput(value: string) {
  // Accept "1990", "1990.50", "1 990,50"
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

