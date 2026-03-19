package models

import "time"

type Order struct {
	ID                  int
	CustomerName       string
	Phone               string
	TotalAmountCents   int
	ConfirmationStatus string
	CreatedAt          time.Time
	Items               []OrderItem
}

type OrderItem struct {
	ID                   int
	OrderID              int
	ProductID            int
	ProductNameSnapshot string
	PriceSnapshot       int
	Quantity            int
}

