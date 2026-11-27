package middleware

import (
	"net/http"
	"strings"

	"classin/api/authz"

	"github.com/labstack/echo/v4"
)

// RequireRole membatasi akses berdasarkan peran kanonik di context.
// Peran dibaca dari tabel profiles (lihat middleware.Auth), sehingga label
// database seperti "super_admin" dan "kepala_sekolah" cocok dengan alias
// "admin", "tu", atau "kepsek" pada daftar yang diizinkan.
func RequireRole(allowed ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			role, ok := c.Get("role").(string)
			role = strings.TrimSpace(role)
			if !ok || role == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing role"})
			}
			for _, allowedRole := range allowed {
				if authz.RoleMatches(role, allowedRole) {
					return next(c)
				}
			}
			c.Logger().Warnf("forbidden: role=%q allowed=%v", role, allowed)
			return c.JSON(http.StatusForbidden, map[string]string{"error": "forbidden"})
		}
	}
}
