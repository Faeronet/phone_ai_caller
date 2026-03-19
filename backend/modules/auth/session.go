package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Token format: base64Url(nonce).hex(hmacSig)
func CreateToken(secret string) (string, error) {
	nonce := make([]byte, 24)
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}

	nonceEnc := base64.RawURLEncoding.EncodeToString(nonce)
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(nonceEnc))
	sig := fmt.Sprintf("%x", mac.Sum(nil))

	return nonceEnc + "." + sig, nil
}

func VerifyToken(secret string, token string) bool {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return false
	}
	nonceEnc := parts[0]
	sigHex := parts[1]

	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(nonceEnc))
	expected := fmt.Sprintf("%x", mac.Sum(nil))

	// Constant time compare on strings -> convert to bytes
	return hmac.Equal([]byte(expected), []byte(sigHex))
}

func SetAdminCookie(w http.ResponseWriter, cookieName string, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
	})
}

