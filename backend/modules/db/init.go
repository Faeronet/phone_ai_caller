package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func InitSchemaAndSeed(ctx context.Context, pool *pgxpool.Pool) error {
	if err := createTables(ctx, pool); err != nil {
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
			-- productId специально без внешнего ключа:
			-- удаление товара не должно ломать историю заказов (snapshots хранятся в OrderItem).
		);`,
		`CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");`,
	}

	for _, stmt := range stmts {
		if _, err := pool.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("create table: %w", err)
		}
	}

	// If the table already exists and was created with a real FK constraint,
	// drop it so that products can be deleted without breaking order history.
	_, _ = pool.Exec(ctx, `ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";`)
	return nil
}

