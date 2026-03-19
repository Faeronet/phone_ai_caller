package handlers

import (
	"crypto/rand"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
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

type adminProductView struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	PriceCents  int    `json:"priceCents"`
	ImageURL    string `json:"imageUrl"`
	CreatedAt   string `json:"createdAt"`
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

func toAdminProductView(p models.Product) adminProductView {
	return adminProductView{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		PriceCents:  p.PriceCents,
		ImageURL:    p.ImageURL,
		CreatedAt:   p.CreatedAt.UTC().Format(time.RFC3339),
	}
}

// POST /api/admin/unlock
func (h AdminHandler) Unlock(w http.ResponseWriter, r *http.Request) {
	var req adminUnlockReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	key := strings.TrimSpace(req.Key)
	if key == "" || key != h.Cfg.AdminSecretKey {
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

func randomHex(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hexEncode(b), nil
}

func hexEncode(b []byte) string {
	const hexdigits = "0123456789abcdef"
	out := make([]byte, len(b)*2)
	for i, v := range b {
		out[i*2] = hexdigits[v>>4]
		out[i*2+1] = hexdigits[v&0x0f]
	}
	return string(out)
}

func isAllowedImageExt(ext string) bool {
	switch strings.ToLower(ext) {
	case ".png", ".jpg", ".jpeg", ".webp", ".gif":
		return true
	default:
		return false
	}
}

// POST /api/admin/products
// multipart/form-data: name, description, priceCents, image(file)
func (h AdminHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(25 << 20); err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid multipart form")
		return
	}

	name := strings.TrimSpace(r.FormValue("name"))
	description := strings.TrimSpace(r.FormValue("description"))
	priceCentsStr := strings.TrimSpace(r.FormValue("priceCents"))
	if name == "" || description == "" || priceCentsStr == "" {
		_ = writeError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	priceCents, err := strconv.Atoi(priceCentsStr)
	if err != nil || priceCents <= 0 {
		_ = writeError(w, http.StatusBadRequest, "Invalid priceCents")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		_ = writeError(w, http.StatusBadRequest, "Image file is required")
		return
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	if ext == "" {
		// Browser may send filename without extension.
		ct := header.Header.Get("Content-Type")
		switch strings.ToLower(ct) {
		case "image/png":
			ext = ".png"
		case "image/jpeg":
			ext = ".jpg"
		case "image/webp":
			ext = ".webp"
		case "image/gif":
			ext = ".gif"
		default:
			ext = ""
		}
	}
	if !isAllowedImageExt(ext) {
		_ = writeError(w, http.StatusBadRequest, "Unsupported image format")
		return
	}

	filenameRand, err := randomHex(16)
	if err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to generate filename")
		return
	}

	destDir := filepath.Join(h.Cfg.UploadDir, "products")
	if err := os.MkdirAll(destDir, 0o755); err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to prepare upload directory")
		return
	}

	filename := filenameRand + ext
	dstPath := filepath.Join(destDir, filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to save file")
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to write file")
		return
	}

	imagePath := "/uploads/products/" + filename

	id, err := h.ProductService.Create(r.Context(), name, description, priceCents, imagePath)
	if err != nil {
		_ = writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	_ = writeJSON(w, http.StatusOK, map[string]any{"product": map[string]any{"id": id}})
}

// GET /api/admin/products
func (h AdminHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	products, err := h.ProductService.List(r.Context())
	if err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to load products")
		return
	}
	out := make([]adminProductView, 0, len(products))
	for _, p := range products {
		out = append(out, toAdminProductView(p))
	}
	_ = writeJSON(w, http.StatusOK, map[string]any{"products": out})
}

// DELETE /api/admin/products/:id
func (h AdminHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		_ = writeError(w, http.StatusBadRequest, "Invalid id")
		return
	}

	imagePath, err := h.ProductService.DeleteByID(r.Context(), id)
	if err != nil {
		_ = writeError(w, http.StatusNotFound, "Product not found")
		return
	}

	// Best-effort file cleanup.
	// Only delete files inside uploads/products to avoid accidents.
	const prefix = "/uploads/products/"
	if strings.HasPrefix(imagePath, prefix) {
		rel := strings.TrimPrefix(imagePath, prefix)
		rel = strings.ReplaceAll(rel, "..", "")
		if strings.Contains(rel, string(os.PathSeparator)) {
			rel = filepath.Base(rel)
		}

		abs := filepath.Join(h.Cfg.UploadDir, "products", rel)
		rootClean := filepath.Clean(h.Cfg.UploadDir)
		absClean := filepath.Clean(abs)
		if strings.HasPrefix(absClean, rootClean) {
			_ = os.Remove(absClean)
		}
	}

	_ = writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

