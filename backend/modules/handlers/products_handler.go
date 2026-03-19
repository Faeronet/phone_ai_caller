package handlers

import (
	"net/http"
	"strconv"

	"phone-ai-caller-backend/modules/models"
	"phone-ai-caller-backend/modules/services"

	"github.com/go-chi/chi/v5"
)

type ProductsHandler struct {
	ProductService services.ProductService
}

func NewProductsHandler(s services.ProductService) ProductsHandler {
	return ProductsHandler{ProductService: s}
}

type productView struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	PriceCents  int    `json:"priceCents"`
	ImageURL    string `json:"imageUrl"`
}

func toProductView(p models.Product) productView {
	return productView{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		PriceCents:  p.PriceCents,
		ImageURL:    p.ImageURL,
	}
}

func (h ProductsHandler) List(w http.ResponseWriter, r *http.Request) {
	products, err := h.ProductService.List(r.Context())
	if err != nil {
		_ = writeError(w, http.StatusInternalServerError, "Failed to load products")
		return
	}

	out := make([]productView, 0, len(products))
	for _, p := range products {
		out = append(out, toProductView(p))
	}

	_ = writeJSON(w, http.StatusOK, map[string]any{"products": out})
}

func (h ProductsHandler) GetOne(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid id")
		return
	}

	product, err := h.ProductService.GetByID(r.Context(), id)
	if err != nil {
		_ = writeError(w, http.StatusNotFound, "Product not found")
		return
	}

	_ = writeJSON(w, http.StatusOK, map[string]any{"product": toProductView(product)})
}

