package middleware

import (
	"encoding/json"
	"net/http"

	"phone-ai-caller-backend/modules/auth"
	"phone-ai-caller-backend/modules/config"
)

type JSONError struct {
	Message string `json:"message"`
}

func AdminAuthMiddleware(cfg config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie(cfg.CookieName)
		if err != nil || c.Value == "" {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_ = jsonWrite(w, JSONError{Message: "Unauthorized"})
			return
		}

		if !auth.VerifyToken(cfg.AdminSecretKey, c.Value) {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_ = jsonWrite(w, JSONError{Message: "Unauthorized"})
			return
		}

		next.ServeHTTP(w, r)
		})
	}
}

func jsonWrite(w http.ResponseWriter, payload any) error {
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(true)
	return enc.Encode(payload)
}

