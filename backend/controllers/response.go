package controllers

import (
	"errors"

	"github.com/labstack/echo/v4"

	"classin/api/services"
	"classin/api/views"
)

func write(c echo.Context, legacy bool, code int, data interface{}, meta interface{}, err error) error {
	if err != nil {
		status, errorCode := mapError(err)
		if legacy {
			return views.Legacy(c, status, map[string]string{"error": err.Error()})
		}
		return views.Fail(c, status, errorCode, err.Error())
	}
	if legacy {
		return views.Legacy(c, code, data)
	}
	return views.Success(c, code, data, meta)
}

func mapError(err error) (int, string) {
	switch {
	case errors.Is(err, services.ErrValidation):
		return 400, "validation_error"
	case errors.Is(err, services.ErrNotFound):
		return 404, "not_found"
	case errors.Is(err, services.ErrConflict):
		return 409, "conflict"
	default:
		return 500, "internal_error"
	}
}

func bindError(err error) error {
	return services.Validation(err.Error())
}
