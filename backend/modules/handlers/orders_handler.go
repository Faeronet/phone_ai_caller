package handlers

import (
	"encoding/json"
	"net/http"

	"phone-ai-caller-backend/modules/repositories"
	"phone-ai-caller-backend/modules/services"
)

type OrdersHandler struct {
	OrderService services.OrderService
}

func NewOrdersHandler(s services.OrderService) OrdersHandler {
	return OrdersHandler{OrderService: s}
}

type createOrderItemReq struct {
	ProductID int `json:"productId"`
	Quantity  int `json:"quantity"`
}

type createOrderReq struct {
	CustomerName string               `json:"customerName"`
	Phone        string               `json:"phone"`
	Items        []createOrderItemReq `json:"items"`
}

func (h OrdersHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req createOrderReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		_ = writeError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	items := make([]repositories.CreateOrderItem, 0, len(req.Items))
	for _, it := range req.Items {
		items = append(items, repositories.CreateOrderItem{
			ProductID: it.ProductID,
			Quantity:  it.Quantity,
		})
	}

	orderID, err := h.OrderService.CreateOrder(r.Context(), req.CustomerName, req.Phone, items)
	if err != nil {
		_ = writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	_ = writeJSON(w, http.StatusOK, map[string]any{"orderId": orderID})
}

