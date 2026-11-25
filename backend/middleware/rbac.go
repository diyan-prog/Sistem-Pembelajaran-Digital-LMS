package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func RequireRole(allowed ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			role, ok := c.Get("role").(string)
			if !ok || role == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing role claim"})
			}
			for _, allowedRole := range allowed {
				if strings.EqualFold(allowedRole, role) {
					return next(c)
				}
			}
			return c.JSON(http.StatusForbidden, map[string]string{"error": "forbidden"})
		}
	}
}