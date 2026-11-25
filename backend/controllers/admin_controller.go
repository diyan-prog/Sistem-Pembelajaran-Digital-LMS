package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"classin/api/models"
	"classin/api/services"
)

type AdminController struct {
	svc *services.AdminService
}

func NewAdminController(svc *services.AdminService) *AdminController {
	return &AdminController{svc: svc}
}

func legacy(c echo.Context) bool { return c.Get("legacy") == true }

func (ctl *AdminController) Dashboard(c echo.Context) error {
	data, err := ctl.svc.Dashboard(c.Request().Context())
	return write(c, legacy(c), http.StatusOK, data, nil, err)
}

func (ctl *AdminController) List(resource string) echo.HandlerFunc {
	return func(c echo.Context) error {
		data, err := ctl.svc.List(c.Request().Context(), resource, c.QueryParam("role"))
		return write(c, legacy(c), http.StatusOK, data, nil, err)
	}
}

// legacyMapelPayload mencerminkan payload lama yang memakai field unexported.
// deprecated: encoding/json tidak mengisi field, sehingga nilainya kosong.
type legacyMapelPayload struct {
	kodeMapel string
	namaMapel string
	teacherID string
}

type legacyLogPayload struct {
	userID      string
	action      string
	description string
}

func bindPayload(c echo.Context, resource string) (interface{}, error) {
	switch resource {
	case "classes":
		var p models.ClassPayload
		err := c.Bind(&p)
		return p, err
	case "jurusan":
		var p models.JurusanPayload
		err := c.Bind(&p)
		return p, err
	case "mapel":
		var p legacyMapelPayload
		err := c.Bind(&p)
		return models.MapelPayload{}, err
	case "siswa":
		var p models.SiswaPayload
		err := c.Bind(&p)
		return p, err
	case "guru":
		var p models.GuruPayload
		err := c.Bind(&p)
		return p, err
	case "jadwal":
		var p models.JadwalPayload
		err := c.Bind(&p)
		return p, err
	case "log":
		var p legacyLogPayload
		err := c.Bind(&p)
		return models.LogPayload{}, err
	default:
		return nil, services.Validation("resource tidak dikenal")
	}
}

func (ctl *AdminController) Create(resource string) echo.HandlerFunc {
	return func(c echo.Context) error {
		payload, err := bindPayload(c, resource)
		if err != nil {
			return write(c, legacy(c), 0, nil, nil, bindError(err))
		}
		data, err := ctl.svc.Create(c.Request().Context(), resource, payload)
		return write(c, legacy(c), http.StatusCreated, data, nil, err)
	}
}

func (ctl *AdminController) Update(resource string) echo.HandlerFunc {
	return func(c echo.Context) error {
		payload, err := bindPayload(c, resource)
		if err != nil {
			return write(c, legacy(c), 0, nil, nil, bindError(err))
		}
		data, err := ctl.svc.Update(c.Request().Context(), resource, c.Param("id"), payload)
		return write(c, legacy(c), http.StatusOK, data, nil, err)
	}
}

func (ctl *AdminController) Delete(resource string) echo.HandlerFunc {
	return func(c echo.Context) error {
		data, err := ctl.svc.Delete(c.Request().Context(), resource, c.Param("id"))
		return write(c, legacy(c), http.StatusOK, data, nil, err)
	}
}
