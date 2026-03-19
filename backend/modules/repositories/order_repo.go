package repositories

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"phone-ai-caller-backend/modules/models"
)

type CreateOrderItem struct {
	ProductID int
	Quantity  int
}

type OrderRepository struct {
	Pool *pgxpool.Pool
}

func (r OrderRepository) CreateOrder(ctx context.Context, customerName, phone string, items []CreateOrderItem) (int, error) {
	if len(items) == 0 {
		return 0, fmt.Errorf("items is empty")
	}

	uniqueProductIDs := make([]int, 0, len(items))
	seen := map[int]struct{}{}
	for _, it := range items {
		if it.ProductID <= 0 || it.Quantity <= 0 {
			return 0, fmt.Errorf("invalid item")
		}
		if _, ok := seen[it.ProductID]; ok {
			continue
		}
		seen[it.ProductID] = struct{}{}
		uniqueProductIDs = append(uniqueProductIDs, it.ProductID)
	}

	placeholders := make([]string, len(uniqueProductIDs))
	args := make([]any, 0, len(uniqueProductIDs))
	for i, id := range uniqueProductIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args = append(args, id)
	}

	query := fmt.Sprintf(`SELECT id, name, price FROM "Product" WHERE id IN (%s)`, strings.Join(placeholders, ","))
	rows, err := r.Pool.Query(ctx, query, args...)
	if err != nil {
		return 0, fmt.Errorf("load products: %w", err)
	}
	defer rows.Close()

	type productRow struct {
		id    int
		name  string
		price int
	}
	byID := map[int]productRow{}
	for rows.Next() {
		var p productRow
		if err := rows.Scan(&p.id, &p.name, &p.price); err != nil {
			return 0, fmt.Errorf("scan product: %w", err)
		}
		byID[p.id] = p
	}
	if rows.Err() != nil {
		return 0, fmt.Errorf("load products rows: %w", rows.Err())
	}
	if len(byID) != len(uniqueProductIDs) {
		return 0, fmt.Errorf("one or more products not found")
	}

	var totalAmount int
	type snapshotItem struct {
		productId int
		name      string
		price     int
		quantity  int
	}
	snaps := make([]snapshotItem, 0, len(items))
	for _, it := range items {
		p, ok := byID[it.ProductID]
		if !ok {
			return 0, fmt.Errorf("product not found")
		}
		totalAmount += p.price * it.Quantity
		snaps = append(snaps, snapshotItem{
			productId: it.ProductID,
			name:      p.name,
			price:     p.price,
			quantity:  it.Quantity,
		})
	}

	tx, err := r.Pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var orderID int
	if err := tx.QueryRow(ctx, `
		INSERT INTO "Order" ("customerName", "phone", "totalAmount", "confirmationStatus")
		VALUES ($1, $2, $3, 'неподтверждено')
		RETURNING id
	`, customerName, phone, totalAmount).Scan(&orderID); err != nil {
		return 0, fmt.Errorf("insert order: %w", err)
	}

	for _, s := range snaps {
		if _, err := tx.Exec(ctx, `
			INSERT INTO "OrderItem" ("orderId", "productId", "productNameSnapshot", "priceSnapshot", "quantity")
			VALUES ($1, $2, $3, $4, $5)
		`, orderID, s.productId, s.name, s.price, s.quantity); err != nil {
			return 0, fmt.Errorf("insert order item: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit tx: %w", err)
	}
	return orderID, nil
}

func (r OrderRepository) ListAdminOrders(ctx context.Context) ([]models.Order, error) {
	rows, err := r.Pool.Query(ctx, `
		SELECT
			o.id,
			o."customerName",
			o."phone",
			o."totalAmount",
			o."confirmationStatus",
			o."createdAt",
			i."productNameSnapshot",
			i."quantity"
		FROM "Order" o
		INNER JOIN "OrderItem" i ON i."orderId" = o.id
		ORDER BY o."createdAt" DESC, i.id ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("list admin orders: %w", err)
	}
	defer rows.Close()

	byID := map[int]*models.Order{}
	orderIDs := make([]int, 0)

	for rows.Next() {
		var (
			orderID int
			o models.Order

			productNameSnapshot string
			quantity            int
		)

		if err := rows.Scan(
			&orderID,
			&o.CustomerName,
			&o.Phone,
			&o.TotalAmountCents,
			&o.ConfirmationStatus,
			&o.CreatedAt,
			&productNameSnapshot,
			&quantity,
		); err != nil {
			return nil, fmt.Errorf("scan order: %w", err)
		}

		o.ID = orderID
		existing := byID[orderID]
		if existing == nil {
			copyOrder := o
			copyOrder.Items = []models.OrderItem{}
			byID[orderID] = &copyOrder
			orderIDs = append(orderIDs, orderID)
			existing = byID[orderID]
		}

		existing.Items = append(existing.Items, models.OrderItem{
			ProductNameSnapshot: productNameSnapshot,
			Quantity:            quantity,
		})
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("list admin orders rows: %w", rows.Err())
	}

	out := make([]models.Order, 0, len(orderIDs))
	for _, id := range orderIDs {
		if o := byID[id]; o != nil {
			out = append(out, *o)
		}
	}
	return out, nil
}

func (r OrderRepository) UpdateConfirmationStatus(ctx context.Context, id int, status string) error {
	tag, err := r.Pool.Exec(ctx, `
		UPDATE "Order"
		SET "confirmationStatus" = $1
		WHERE id = $2
	`, status, id)
	if err != nil {
		return fmt.Errorf("update confirmation status: %w", err)
	}

	affected := tag.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("order not found")
	}
	return nil
}

func NewOrderRepository(pool *pgxpool.Pool) OrderRepository {
	return OrderRepository{Pool: pool}
}

