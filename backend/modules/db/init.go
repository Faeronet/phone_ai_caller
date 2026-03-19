package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DefaultProduct struct {
	Name        string
	Description string
	PriceCents  int
	ImageURL    string
}

var defaultProducts = []DefaultProduct{
	{
		Name:        "Noir Velvet",
		Description: "Глубокий, бархатный аромат с тёплым шлейфом. Идеален для вечера и уверенного впечатления.",
		PriceCents:  329000,
		ImageURL:    "https://source.unsplash.com/featured/900x900/?perfume,noir,velvet&sig=11",
	},
	{
		Name:        "Amber Essence",
		Description: "Солнечно-янтарный характер: мягкие древесные ноты и нежная сладость. Лёгкий и притягательный.",
		PriceCents:  279000,
		ImageURL:    "https://source.unsplash.com/featured/900x900/?perfume,amber,essence&sig=22",
	},
}

func InitSchemaAndSeed(ctx context.Context, pool *pgxpool.Pool) error {
	if err := createTables(ctx, pool); err != nil {
		return err
	}
	if err := seedProducts(ctx, pool); err != nil {
		return err
	}
	return nil
}

func createTables(ctx context.Context, pool *pgxpool.Pool) error {
	// The table/column names match Prisma defaults for camelCase fields
	// (e.g. imageUrl, createdAt, totalAmount).
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS "Product" (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL UNIQUE,
			description TEXT NOT NULL,
			price INTEGER NOT NULL,
			"imageUrl" TEXT NOT NULL,
			"createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
		);`,
		`CREATE TABLE IF NOT EXISTS "Order" (
			id SERIAL PRIMARY KEY,
			"customerName" TEXT NOT NULL,
			"phone" TEXT NOT NULL,
			"totalAmount" INTEGER NOT NULL,
			"confirmationStatus" TEXT NOT NULL DEFAULT 'неподтверждено',
			"createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
		);`,
		`CREATE TABLE IF NOT EXISTS "OrderItem" (
			id SERIAL PRIMARY KEY,
			"orderId" INTEGER NOT NULL,
			"productId" INTEGER NOT NULL,
			"productNameSnapshot" TEXT NOT NULL,
			"priceSnapshot" INTEGER NOT NULL,
			"quantity" INTEGER NOT NULL,
			CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE,
			CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id)
		);`,
		`CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");`,
	}

	for _, stmt := range stmts {
		if _, err := pool.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("create table: %w", err)
		}
	}
	return nil
}

func seedProducts(ctx context.Context, pool *pgxpool.Pool) error {
	for _, p := range defaultProducts {
		_, err := pool.Exec(ctx, `
			INSERT INTO "Product" (name, description, price, "imageUrl")
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (name) DO UPDATE
			SET description = EXCLUDED.description,
				price = EXCLUDED.price,
				"imageUrl" = EXCLUDED."imageUrl"
		`, p.Name, p.Description, p.PriceCents, p.ImageURL)
		if err != nil {
			return fmt.Errorf("seed product %s: %w", p.Name, err)
		}
	}
	return nil
}

