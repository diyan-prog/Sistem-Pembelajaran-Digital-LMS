package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type Claims struct {
	Sub  string `json:"sub"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func Auth() echo.MiddlewareFunc {
	secret := []byte(os.Getenv("SUPABASE_JWT_SECRET"))
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			header := c.Request().Header.Get(echo.HeaderAuthorization)
			if !strings.HasPrefix(header, "Bearer ") {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing or invalid token"})
			}
			tokenStr := strings.TrimPrefix(header, "Bearer ")
			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
				return secret, nil
			}, jwt.WithValidMethods([]string{"HS256", "HS384", "HS512"}))
			if err != nil || !token.Valid {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
			}
			c.Set("user_id", claims.Sub)
			c.Set("role", claims.Role)
			return next(c)
		}
	}
}
