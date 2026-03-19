package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port           string
	DatabaseURL    string
	AdminSecretKey string
	CookieName     string
}

func Load() (Config, error) {
	port := envOrDefault("BACKEND_PORT", "8081")
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	secret := os.Getenv("ADMIN_SECRET_KEY")
	if secret == "" {
		return Config{}, fmt.Errorf("ADMIN_SECRET_KEY is required")
	}

	cookieName := envOrDefault("ADMIN_COOKIE_NAME", "phone_ai_caller_admin")

	return Config{
		Port:            port,
		DatabaseURL:    dbURL,
		AdminSecretKey: secret,
		CookieName:     cookieName,
	}, nil
}

func envOrDefault(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

