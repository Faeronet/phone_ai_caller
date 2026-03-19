package routes

import (
	"net/http"

	"phone-ai-caller-backend/modules/config"
	"phone-ai-caller-backend/modules/handlers"
	"phone-ai-caller-backend/modules/middleware"
	"phone-ai-caller-backend/modules/services"

	"github.com/go-chi/chi/v5"
)

func NewRouter(cfg config.Config, productService services.ProductService, orderService services.OrderService) http.Handler {
	r := chi.NewRouter()
	r.Get("/healthz", func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_, _ = w.Write([]byte(`{"ok":true}`))
	})

	productsH := handlers.NewProductsHandler(productService)
	ordersH := handlers.NewOrdersHandler(orderService)
	adminH := handlers.NewAdminHandler(cfg, productService, orderService)

	r.Route("/api", func(api chi.Router) {
		api.Get("/products", productsH.List)
		api.Get("/products/{id}", productsH.GetOne)
		api.Post("/orders", ordersH.Create)

		api.Route("/admin", func(ad chi.Router) {
			ad.Post("/unlock", adminH.Unlock)

			ad.Group(func(g chi.Router) {
				g.Use(middleware.AdminAuthMiddleware(cfg))

				g.Get("/verify", adminH.Verify)
				g.Get("/orders", adminH.ListOrders)
				g.Patch("/orders/{id}/status", adminH.UpdateOrderStatus)
				g.Post("/products", adminH.CreateProduct)
			})
		})
	})

	return r
}

