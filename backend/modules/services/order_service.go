package services

import (
	"context"
	"fmt"

	"phone-ai-caller-backend/modules/models"
	"phone-ai-caller-backend/modules/repositories"
	"phone-ai-caller-backend/modules/validators"
)

type OrderService struct {
	Repo repositories.OrderRepository
}

func NewOrderService(repo repositories.OrderRepository) OrderService {
	return OrderService{Repo: repo}
}

type CreateOrderItem = repositories.CreateOrderItem

func (s OrderService) CreateOrder(ctx context.Context, customerName, phone string, items []CreateOrderItem) (int, error) {
	if customerName == "" {
		return 0, fmt.Errorf("customerName required")
	}
	normalizedPhone, err := validators.NormalizeBelarusMobilePhone(phone)
	if err != nil {
		return 0, err
	}
	if len(items) == 0 {
		return 0, fmt.Errorf("items required")
	}
	return s.Repo.CreateOrder(ctx, customerName, normalizedPhone, items)
}

func (s OrderService) ListAdminOrders(ctx context.Context) ([]models.Order, error) {
	return s.Repo.ListAdminOrders(ctx)
}

func (s OrderService) UpdateConfirmationStatus(ctx context.Context, id int, status string) error {
	if id <= 0 {
		return fmt.Errorf("invalid order id")
	}
	allowed := map[string]struct{}{
		"неподтверждено": {},
		"подтверждено":   {},
	}
	if _, ok := allowed[status]; !ok {
		return fmt.Errorf("invalid confirmationStatus")
	}
	return s.Repo.UpdateConfirmationStatus(ctx, id, status)
}

func (s OrderService) DeleteOrder(ctx context.Context, id int) error {
	if id <= 0 {
		return fmt.Errorf("invalid order id")
	}
	return s.Repo.DeleteByID(ctx, id)
}

