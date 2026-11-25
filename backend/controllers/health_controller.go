package controllers

import (
	"time"

	"github.com/labstack/echo/v4"

	"classin/api/views"
)

const appVersion = "1.0.0"

var startedAt = time.Now()

type HealthData struct {
	Status  string `json:"status"`
	Uptime  string `json:"uptime"`
	Version string `json:"version"`
}

func Health(c echo.Context) error {
	return views.Success(c, 200, HealthData{
		Status:  "ok",
		Uptime:  time.Since(startedAt).String(),
		Version: appVersion,
	}, nil)
}

// Ping mempertahankan bentuk respons lama {"message":"pong"}.
// deprecated: gunakan /api/v1/health.
func Ping(c echo.Context) error {
	return views.Legacy(c, 200, map[string]string{"message": "pong"})
}
