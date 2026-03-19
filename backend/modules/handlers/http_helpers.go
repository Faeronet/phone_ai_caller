package handlers

import (
	"encoding/json"
	"net/http"
)

func writeJSON(w http.ResponseWriter, status int, payload any) error {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(true)
	return enc.Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) error {
	return writeJSON(w, status, map[string]string{"message": message})
}

