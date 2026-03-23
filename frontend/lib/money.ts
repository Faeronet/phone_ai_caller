const centsToUnits = (amountCents: number) => amountCents / 100;

export function formatByn(amountCents: number) {
  const safeCents = Number.isFinite(amountCents) ? amountCents : 0;
  const integerPart = Math.trunc(safeCents / 100);
  const centsPart = Math.abs(safeCents % 100);

  const intFmt = new Intl.NumberFormat("be-BY", {
    maximumFractionDigits: 0
  });

  // Если копеек нет — показываем только целое: "40 Br"
  if (centsPart === 0) {
    return `${intFmt.format(integerPart)} Br`;
  }

  // Если копейки есть — показываем 2 знака: "40,09 Br"
  const centsStr = String(centsPart).padStart(2, "0");
  return `${intFmt.format(integerPart)},${centsStr} Br`;
}

// Backward-compatible alias for existing imports.
export function formatRub(amountCents: number) {
  return formatByn(amountCents);
}

export function rubToCentsFromInput(value: string) {
  // Accept "1990", "1990.50", "1 990,50", and also "40,0", "40,"
  const normalized = value.replace(/\s/g, "").trim().replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

