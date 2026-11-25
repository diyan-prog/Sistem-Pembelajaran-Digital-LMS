package middleware

import (
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

type rateBucket struct {
	mu   sync.Mutex
	hits map[string][]time.Time
	max  int
	win  time.Duration
}

func RateLimit() echo.MiddlewareFunc {
	max, _ := strconv.Atoi(os.Getenv("RATE_LIMIT_MAX"))
	if max == 0 {
		max = 100
	}
	winSec, _ := strconv.Atoi(os.Getenv("RATE_LIMIT_WINDOW"))
	if winSec == 0 {
		winSec = 60
	}
	b := &rateBucket{
		hits: make(map[string][]time.Time),
		max:  max,
		win:  time.Duration(winSec) * time.Second,
	}
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !b.allow(c.RealIP()) {
				return c.JSON(http.StatusTooManyRequests, map[string]string{"error": "too many requests"})
			}
			return next(c)
		}
	}
}

func (b *rateBucket) allow(ip string) bool {
	b.mu.Lock()
	defer b.mu.Unlock()
	now := time.Now()
	cutoff := now.Add(-b.win)
	kept := make([]time.Time, 0, len(b.hits[ip]))
	for _, t := range b.hits[ip] {
		if t.After(cutoff) {
			kept = append(kept, t)
		}
	}
	if len(kept) >= b.max {
		b.hits[ip] = kept
		return false
	}
	b.hits[ip] = append(kept, now)
	return true
}
