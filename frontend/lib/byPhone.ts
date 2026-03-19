const BY_PHONE_ERROR_MESSAGE = "Введите корректный мобильный номер Беларуси в формате +375 (код оператора + 7 цифр абонента)";

const byMobilePhoneRe = new RegExp(
  // Правило:
  // +37525/ +37529 => после префикса ровно 7 цифр, при этом первая из них (код оператора) ограничена.
  // +37533/ +37544 => после префикса ровно 7 цифр без дополнительных ограничений.
  "^\\+375(?:(?:25[5679])\\d{6}|(?:29[12356789])\\d{6}|(?:33)\\d{7}|(?:44)\\d{7})$"
);

// Нормализация: убираем пробелы/дефисы/скобки, приводим к формату +375XXXXXXXXX (без разделителей).
// Строго: разрешены только цифры, '+' (только в начале) и разделители ' ', '-', '(', ')'.
export function normalizeBelarusMobilePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let out = "";
  let sawPlus = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const isDigit = ch >= "0" && ch <= "9";

    if (isDigit) {
      out += ch;
      continue;
    }

    if (ch === "+") {
      if (i !== 0 || sawPlus) return null;
      sawPlus = true;
      out += "+";
      continue;
    }

    // Разрешенные разделители
    if (ch === "-" || ch === "(" || ch === ")" || /\s/.test(ch)) {
      continue;
    }

    // Любые другие символы => сразу ошибка (буквы/прочие префиксы и т.п.)
    return null;
  }

  if (!sawPlus) return null;
  if (!out.startsWith("+375")) return null;

  return out;
}

export function isValidBelarusMobilePhone(normalized: string): boolean {
  return byMobilePhoneRe.test(normalized);
}

export function validateBelarusMobilePhone(input: string): { ok: true; normalized: string } | { ok: false; message: string } {
  const normalized = normalizeBelarusMobilePhone(input);
  if (!normalized) {
    return { ok: false, message: BY_PHONE_ERROR_MESSAGE };
  }
  if (!isValidBelarusMobilePhone(normalized)) {
    return { ok: false, message: BY_PHONE_ERROR_MESSAGE };
  }
  return { ok: true, normalized };
}

export { BY_PHONE_ERROR_MESSAGE };

