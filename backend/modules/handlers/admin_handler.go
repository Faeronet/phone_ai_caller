package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"phone-ai-caller-backend/modules/auth"
	"phone-ai-caller-backend/modules/config"
	"phone-ai-caller-backend/modules/models"
	"phone-ai-caller-backend/modules/services"

	"github.com/go-chi/chi/v5"
)

type AdminHandler struct {
	Cfg             config.Config
	ProductService services.ProductService
	OrderService   services.OrderService
}

func NewAdminHandler(cfg config.Config, productService services.ProductService, orderService services.OrderService) AdminHandler {
	return AdminHandler{
		Cfg:             cfg,
		ProductService: productService,
		OrderService:   orderService,
	}
}

type adminUnlockReq struct {
	Key string `json:"key"`
}

type statusUpdateReq struct {
	ConfirmationStatus string `json:"confirmationStatus"`
}

type createProductReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	PriceCents  int    `json:"priceCents"`
	ImageURL    string `json:"imageUrl"`
}

type orderItemView struct {
	ProductNameSnapshot string `json:"productNameSnapshot"`
	Quantity            int    `json:"quantity"`
}

type orderView struct {
	ID                  int               `json:"id"`
	CustomerName       string            `json:"customerName"`
	Phone               string            `json:"phone"`
	TotalAmount        int               `json:"totalAmount"`
	ConfirmationStatus string            `json:"confirmationStatus"`
	CreatedAt          string            `json:"createdAt"`
	Items               []orderItemView `json:"items"`
}

func toOrderView(o models.Order) orderView {
	items := make([]orderItemView, 0, len(o.Items))
	for _, it := range o.Items {
		items = append(items, orderItemView{
			ProductNameSnapshot: it.ProductNameSnapshot,
			Quantity:            it.Quantity,
		})
	}
	return orderView{
		ID:                  o.ID,
		CustomerName:       o.CustomerName,
		Phone:               o.Phone,
		TotalAmount:        o.TotalAmountCents,
		ConfirmationStatus: o.ConfirmationStatus,
		CreatedAt:          o.CreatedAt.UTC().Format(time.RFC3339),
		Items:               items,
	}
}

// POST /api/admin/unlock
func (h AdminHandler) Unlock(w http.ResponseWriter, r *http.Request) {
	var req adminUnlockReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	if req.Key == "" || req.Key != h.Cfg.AdminSecretKey {
		_ = writeError(w, http.StatusUnauthorized, "Неверный ключ")
		return
	}

	token, err := auth.CreateToken(h.Cfg.AdminSecretKey)
	if err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to create token")
		return
	}

	auth.SetAdminCookie(w, h.Cfg.CookieName, token)
	_ = writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// GET /api/admin/verify
// Protected by middleware in routes.
func (h AdminHandler) Verify(w http.ResponseWriter, r *http.Request) {
	_ = writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// GET /api/admin/orders
func (h AdminHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	orders, err := h.OrderService.ListAdminOrders(r.Context())
	if err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to load orders")
		return
	}

	out := make([]orderView, 0, len(orders))
	for _, o := range orders {
		out = append(out, toOrderView(o))
	}
	_ = writeJSON(w, http.StatusOK, map[string]any{"orders": out})
}

// PATCH /api/admin/orders/:id/status
func (h AdminHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid id")
		return
	}

	var req statusUpdateReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	if err := h.OrderService.UpdateConfirmationStatus(r.Context(), id, req.ConfirmationStatus); err != nil {
		_ = writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	_ = writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// POST /api/admin/products
func (h AdminHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req createProductReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	id, err := h.ProductService.Create(r.Context(), req.Name, req.Description, req.PriceCents, req.ImageURL)
	if err != nil {
		_ = writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	_ = writeJSON(w, http.StatusOK, map[string]any{"product": map[string]any{"id": id}})
}

