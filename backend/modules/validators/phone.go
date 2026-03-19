package validators

import (
	"fmt"
	"strings"
	"unicode"
)

const byPhoneErrorMessage = "Введите корректный мобильный номер Беларуси в формате +375 (код оператора + 7 цифр абонента)"

// NormalizeBelarusMobilePhone:
// - строго принимает +375...
// - допускает разделители: пробел, '-', '(', ')'
// - отклоняет любые другие символы (буквы и т.п.)
// - возвращает нормализованный номер в виде +375XXXXXXXXX (без разделителей)
func NormalizeBelarusMobilePhone(input string) (string, error) {
	raw := strings.TrimSpace(input)
	if raw == "" {
		return "", fmt.Errorf(byPhoneErrorMessage)
	}

	var b strings.Builder
	sawPlus := false

	for i, r := range raw {
		switch {
		case r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == '+':
			if i != 0 || sawPlus {
				return "", fmt.Errorf(byPhoneErrorMessage)
			}
			sawPlus = true
			b.WriteRune(r)
		case r == ' ' || r == '-' || r == '(' || r == ')':
			// allowed separators
		case r == '\t' || r == '\n' || r == '\r':
			// allowed separators
		default:
			// reject any other symbols (letters, other punctuation, etc.)
			_ = unicode.IsLetter(r) // keep import usage for older toolchains; logic is still "reject"
			return "", fmt.Errorf(byPhoneErrorMessage)
		}
	}

	normalized := b.String()
	if !sawPlus || !strings.HasPrefix(normalized, "+375") {
		return "", fmt.Errorf(byPhoneErrorMessage)
	}

	if !isValidBelarusMobilePhone(normalized) {
		return "", fmt.Errorf(byPhoneErrorMessage)
	}
	return normalized, nil
}

func isValidBelarusMobilePhone(normalized string) bool {
	// +37525/ +37529 => после префикса ровно 7 цифр, при этом первая из них ограничена списком.
	// +37533/ +37544 => после префикса ровно 7 цифр без дополнительных ограничений.
	//
	// Реальные паттерны в терминах строки:
	// +37525[5679]\d{6}
	// +37529[12356789]\d{6}
	// +37533\d{7}
	// +37544\d{7}
	if len(normalized) == 0 {
		return false
	}

	// Нормализованный формат всегда: '+' + цифры, поэтому длина зависит от префикса:
	// +375 + (2 + 7) digits = 12 chars with '+' => 12? (проверки делаем регулярными).
	if !(strings.HasPrefix(normalized, "+37525") || strings.HasPrefix(normalized, "+37529") || strings.HasPrefix(normalized, "+37533") || strings.HasPrefix(normalized, "+37544")) {
		return false
	}

	digits := strings.TrimPrefix(normalized, "+")
	// digits should be "375..." (starts with 375 by construction)
	_ = digits

	// Проверяем по префиксам без regexp, чтобы было предельно прозрачно.
	if strings.HasPrefix(normalized, "+37525") {
		rest := strings.TrimPrefix(normalized, "+37525") // 7 digits, где первая ограничена
		if len(rest) != 7 {
			return false
		}
		first := rest[0]
		if first != '5' && first != '6' && first != '7' && first != '9' {
			return false
		}
		for i := 0; i < len(rest); i++ {
			if rest[i] < '0' || rest[i] > '9' {
				return false
			}
		}
		return true
	}

	if strings.HasPrefix(normalized, "+37529") {
		rest := strings.TrimPrefix(normalized, "+37529") // 7 digits, где первая ограничена
		if len(rest) != 7 {
			return false
		}
		first := rest[0]
		okFirst := first == '1' || first == '2' || first == '3' || first == '5' || first == '6' || first == '7' || first == '8' || first == '9'
		if !okFirst {
			return false
		}
		for i := 0; i < len(rest); i++ {
			if rest[i] < '0' || rest[i] > '9' {
				return false
			}
		}
		return true
	}

	if strings.HasPrefix(normalized, "+37533") {
		rest := strings.TrimPrefix(normalized, "+37533") // 7 digits
		return len(rest) == 7 && rest[0] >= '0' && rest[0] <= '9' && allDigits(rest)
	}

	if strings.HasPrefix(normalized, "+37544") {
		rest := strings.TrimPrefix(normalized, "+37544") // 7 digits
		return len(rest) == 7 && rest[0] >= '0' && rest[0] <= '9' && allDigits(rest)
	}

	return false
}

func allDigits(s string) bool {
	for i := 0; i < len(s); i++ {
		if s[i] < '0' || s[i] > '9' {
			return false
		}
	}
	return true
}

