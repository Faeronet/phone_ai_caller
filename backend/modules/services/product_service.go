package services

import (
	"context"
	"fmt"

	"phone-ai-caller-backend/modules/models"
	"phone-ai-caller-backend/modules/repositories"
)

type ProductService struct {
	Repo repositories.ProductRepository
}

func NewProductService(repo repositories.ProductRepository) ProductService {
	return ProductService{Repo: repo}
}

func (s ProductService) List(ctx context.Context) ([]models.Product, error) {
	return s.Repo.List(ctx)
}

func (s ProductService) GetByID(ctx context.Context, id int) (models.Product, error) {
	if id <= 0 {
		return models.Product{}, fmt.Errorf("invalid id")
	}
	return s.Repo.GetByID(ctx, id)
}

func (s ProductService) Create(ctx context.Context, name, description string, priceCents int, imageUrl string) (int, error) {
	if name == "" || description == "" || imageUrl == "" {
		return 0, fmt.Errorf("missing fields")
	}
	if priceCents <= 0 {
		return 0, fmt.Errorf("invalid priceCents")
	}
	return s.Repo.Create(ctx, name, description, priceCents, imageUrl)
}

