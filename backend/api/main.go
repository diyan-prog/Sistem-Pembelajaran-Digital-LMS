package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var dbPool *pgxpool.Pool

func main() {
	var err error
	dbPool, err = pgxpool.New(context.Background(), os.Getenv("DB_URL"))
	if err != nil {
		log.Fatalf("unable to connect to database: %v\n", err)
	}
	defer dbPool.Close()

	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "pong"})
	})

	api := e.Group("/api")
	api.Use(middleware.Logger())

	// existing student/teacher endpoints (brief)
	api.GET("/me", func(c echo.Context) error {
		userID := c.Get("user_id").(string)
		var name, email, role string
		dbPool.QueryRow(context.Background(), "SELECT full_name, email, role FROM profiles WHERE id = $1", userID).Scan(&name, &email, &role)
		return c.JSON(http.StatusOK, map[string]string{"id": userID, "name": name, "email": email, "role": role})
	})

	// admin routes
	RegisterAdminRoutes(api)

	addr := ":" + os.Getenv("PORT")
	if addr == ":" {
		addr = ":8080"
	}
	log.Printf("server running on %s", addr)
	if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}