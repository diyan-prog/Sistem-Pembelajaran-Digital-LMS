package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"

	"classin/api/config"
	"classin/api/controllers"
	"classin/api/repositories"
	"classin/api/routes"
	"classin/api/services"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	db, err := repositories.NewDB(cfg.DBURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer db.Close()

	akunRepo := repositories.NewAkunRepository(db, cfg.SupabaseURL, cfg.ServiceRoleKey)
	adminRepo := repositories.NewAdminRepository(db)
	akademikRepo := repositories.NewAkademikRepository(db)
	akun := controllers.NewAkunController(services.NewAkunService(akunRepo))
	admin := controllers.NewAdminController(services.NewAdminService(adminRepo))
	akademik := controllers.NewAkademikController(services.NewAkademikService(akademikRepo))

	e := echo.New()
	routes.Register(e, cfg, db, akun, admin, akademik)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	addr := fmt.Sprintf(":%s", cfg.Port)
	go func() {
		log.Printf("server running on %s", addr)
		if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
			log.Printf("server: %v", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
