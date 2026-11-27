package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"classin/api/services"
)

type AkademikController struct {
	svc *services.AkademikService
}

func NewAkademikController(svc *services.AkademikService) *AkademikController {
	return &AkademikController{svc: svc}
}

// Bootstrap mengirim seluruh data akademik yang boleh dibaca pengguna.
func (ctl *AkademikController) Bootstrap(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	data, err := ctl.svc.Bootstrap(c.Request().Context(), userID)
	return write(c, false, http.StatusOK, data, nil, err)
}
