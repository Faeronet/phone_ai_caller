package models

import "time"

type Product struct {
	ID          int
	Name        string
	Description string
	PriceCents  int
	ImageURL    string
	CreatedAt   time.Time
}

