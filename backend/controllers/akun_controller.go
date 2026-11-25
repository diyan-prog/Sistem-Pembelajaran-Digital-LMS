package controllers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"classin/api/models"
	"classin/api/services"
)

type AkunController struct {
	svc *services.AkunService
}

func NewAkunController(svc *services.AkunService) *AkunController {
	return &AkunController{svc: svc}
}

func (ctl *AkunController) Me(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	data, err := ctl.svc.Me(c.Request().Context(), userID)
	return write(c, c.Get("legacy") == true, http.StatusOK, data, nil, err)
}

func (ctl *AkunController) UpdateMe(c echo.Context) error {
	var payload models.SelfProfilePayload
	if err := c.Bind(&payload); err != nil {
		return write(c, c.Get("legacy") == true, 0, nil, nil, bindError(err))
	}
	userID, _ := c.Get("user_id").(string)
	data, err := ctl.svc.UpdateMe(c.Request().Context(), userID, payload)
	return write(c, c.Get("legacy") == true, http.StatusOK, data, nil, err)
}

func (ctl *AkunController) GetProfile(c echo.Context) error {
	data, err := ctl.svc.GetProfile(c.Request().Context(), c.Param("id"))
	return write(c, c.Get("legacy") == true, http.StatusOK, data, nil, err)
}

func (ctl *AkunController) ListProfiles(c echo.Context) error {
	data, err := ctl.svc.ListProfiles(c.Request().Context(), c.QueryParam("role"))
	return write(c, c.Get("legacy") == true, http.StatusOK, data, nil, err)
}

func (ctl *AkunController) CreateProfile(c echo.Context) error {
	var payload models.CreateProfilePayload
	if err := c.Bind(&payload); err != nil {
		return write(c, c.Get("legacy") == true, 0, nil, nil, bindError(err))
	}
	data, err := ctl.svc.CreateProfile(c.Request().Context(), payload)
	return write(c, c.Get("legacy") == true, http.StatusCreated, data, nil, err)
}

func (ctl *AkunController) UpdateProfile(c echo.Context) error {
	var payload models.UpdateProfilePayload
	if err := c.Bind(&payload); err != nil {
		return write(c, c.Get("legacy") == true, 0, nil, nil, bindError(err))
	}
	data, err := ctl.svc.UpdateProfile(c.Request().Context(), c.Param("id"), payload)
	return write(c, c.Get("legacy") == true, http.StatusOK, data, nil, err)
}

func (ctl *AkunController) DeleteProfile(c echo.Context) error {
	data, err := ctl.svc.DeleteProfile(c.Request().Context(), c.Param("id"))
	return write(c, c.Get("legacy") == true, http.StatusOK, data, nil, err)
}

type userActionPayload struct {
	Action       string                 `json:"action"`
	Email        string                 `json:"email"`
	Password     string                 `json:"password"`
	EmailConfirm bool                   `json:"email_confirm"`
	UserMetadata map[string]interface{} `json:"user_metadata"`
	ID           string                 `json:"id"`
	Role         string                 `json:"role"`
	Status       string                 `json:"status"`
	ProfileKind  string                 `json:"profile_kind"`
	Nis          string                 `json:"nis"`
	Nip          string                 `json:"nip"`
	KelasID      string                 `json:"kelas_id"`
	JenisKelamin string                 `json:"jenis_kelamin"`
}

// UserAction menggantikan aksi Edge Function admin-users.
func (ctl *AkunController) UserAction(c echo.Context) error {
	var payload userActionPayload
	if err := c.Bind(&payload); err != nil {
		return write(c, c.Get("legacy") == true, 0, nil, nil, bindError(err))
	}
	ctx := c.Request().Context()
	var data interface{}
	var err error
	switch payload.Action {
	case "create":
		data, err = ctl.svc.CreateUser(ctx, models.CreateUserPayload{
			Email: payload.Email, Password: payload.Password,
			EmailConfirm: payload.EmailConfirm, UserMetadata: payload.UserMetadata,
			ProfileKind: payload.ProfileKind, Nis: payload.Nis, Nip: payload.Nip,
			KelasID: payload.KelasID, JenisKelamin: payload.JenisKelamin,
			Status: payload.Status,
		})
	case "update-role":
		err = ctl.svc.UpdateRole(ctx, models.UpdateFieldPayload{ID: payload.ID, Role: payload.Role})
		data = map[string]bool{"ok": true}
	case "update-status":
		err = ctl.svc.UpdateStatus(ctx, models.UpdateFieldPayload{ID: payload.ID, Status: payload.Status})
		data = map[string]bool{"ok": true}
	case "reset-password":
		err = ctl.svc.ResetPassword(ctx, models.ResetPasswordPayload{ID: payload.ID, Password: payload.Password})
		data = map[string]bool{"ok": true}
	case "delete":
		err = ctl.svc.DeleteUser(ctx, payload.ID)
		data = map[string]bool{"ok": true}
	default:
		err = services.Validation("aksi tidak dikenal")
	}
	return write(c, c.Get("legacy") == true, http.StatusOK, data, nil, err)
}
