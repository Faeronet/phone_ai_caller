package repositories

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"phone-ai-caller-backend/modules/models"
)

type ProductRepository struct {
	Pool *pgxpool.Pool
}

func (r ProductRepository) List(ctx context.Context) ([]models.Product, error) {
	rows, err := r.Pool.Query(ctx, `
		SELECT id, name, description, price, "imageUrl", "createdAt"
		FROM "Product"
		ORDER BY "createdAt" DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("list products: %w", err)
	}
	defer rows.Close()

	var out []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.ImageURL, &p.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan product: %w", err)
		}
		out = append(out, p)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("list products rows: %w", rows.Err())
	}
	return out, nil
}

func (r ProductRepository) GetByID(ctx context.Context, id int) (models.Product, error) {
	row := r.Pool.QueryRow(ctx, `
		SELECT id, name, description, price, "imageUrl", "createdAt"
		FROM "Product"
		WHERE id = $1
	`, id)

	var p models.Product
	if err := row.Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.ImageURL, &p.CreatedAt); err != nil {
		return models.Product{}, fmt.Errorf("get product: %w", err)
	}
	return p, nil
}

func (r ProductRepository) Create(ctx context.Context, name, description string, priceCents int, imageUrl string) (int, error) {
	var id int
	if err := r.Pool.QueryRow(ctx, `
		INSERT INTO "Product" (name, description, price, "imageUrl")
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, name, description, priceCents, imageUrl).Scan(&id); err != nil {
		return 0, fmt.Errorf("create product: %w", err)
	}
	return id, nil
}

func NewProductRepository(pool *pgxpool.Pool) ProductRepository {
	return ProductRepository{Pool: pool}
}

