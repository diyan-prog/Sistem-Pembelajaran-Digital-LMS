package controllers

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"classin/api/models"
	"classin/api/services"
	"classin/api/views"
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
		var p models.MapelPayload
		err := c.Bind(&p)
		return p, err
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
		var p models.LogPayload
		err := c.Bind(&p)
		return p, err
	case "pengumuman":
		var p models.PengumumanPayload
		err := c.Bind(&p)
		return p, err
	case "presensi":
		var p models.PresensiPayload
		err := c.Bind(&p)
		return p, err
	case "tugas":
		var p models.TugasPayload
		err := c.Bind(&p)
		return p, err
	case "pengumpulan_tugas":
		var p models.PengumpulanTugasPayload
		err := c.Bind(&p)
		return p, err
	case "kuis":
		var p models.KuisPayload
		err := c.Bind(&p)
		return p, err
	case "tahun_ajaran":
		var p models.TahunAjaranPayload
		err := c.Bind(&p)
		return p, err
	case "pengaturan":
		var p models.PengaturanPayload
		err := c.Bind(&p)
		return p, err
	case "materi":
		var p models.MateriPayload
		err := c.Bind(&p)
		return p, err
	case "pertemuan":
		var p models.PertemuanPayload
		err := c.Bind(&p)
		return p, err
	case "soal_kuis":
		var p models.SoalKuisPayload
		err := c.Bind(&p)
		return p, err
	case "hasil_kuis":
		var p models.HasilKuisPayload
		err := c.Bind(&p)
		return p, err
	case "notifikasi":
		var p models.NotifikasiPayload
		err := c.Bind(&p)
		return p, err
	case "pengampu":
		var p models.PengampuPayload
		err := c.Bind(&p)
		return p, err
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

// SiswaPengampu mengembalikan pengampu untuk satu siswa.
func (ctl *AdminController) SiswaPengampu(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	role, _ := c.Get("role").(string)
	if c.Param("id") != userID && !isAdminRole(role) {
		return views.Fail(c, http.StatusForbidden, "forbidden", "tidak diizinkan mengakses data siswa lain")
	}
	data, err := ctl.svc.SiswaPengampu(c.Request().Context(), c.Param("id"))
	return write(c, legacy(c), http.StatusOK, data, nil, err)
}

func isAdminRole(role string) bool {
	s := strings.ToLower(strings.ReplaceAll(role, "_", "-"))
	return strings.Contains(s, "admin") || s == "tu" || s == "tata-usaha" || strings.Contains(s, "kepala") || strings.Contains(s, "wali") || strings.Contains(s, "guru")
}
