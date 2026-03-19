package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"phone-ai-caller-backend/modules/config"
	"phone-ai-caller-backend/modules/db"
	"phone-ai-caller-backend/modules/repositories"
	"phone-ai-caller-backend/modules/routes"
	"phone-ai-caller-backend/modules/services"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	if err := db.InitSchemaAndSeed(context.Background(), pool); err != nil {
		log.Fatalf("init schema: %v", err)
	}

	productRepo := repositories.NewProductRepository(pool)
	orderRepo := repositories.NewOrderRepository(pool)

	productService := services.NewProductService(productRepo)
	orderService := services.NewOrderService(orderRepo)

	handler := routes.NewRouter(cfg, productService, orderService)

	addr := ":" + cfg.Port
	log.Printf("Phone AI Caller backend listening on %s", addr)
	server := &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server: %v", err)
	}
}

