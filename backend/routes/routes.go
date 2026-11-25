package routes

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"classin/api/config"
	"classin/api/controllers"
	apimw "classin/api/middleware"
)

func Register(e *echo.Echo, cfg *config.Config, akun *controllers.AkunController, admin *controllers.AdminController) {
	e.Use(apimw.CORS(cfg.AppOrigin))
	e.Use(apimw.RateLimit())
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/api/v1/health", controllers.Health)
	e.GET("/ping", controllers.Ping) // deprecated: alias /api/v1/health

	legacyAdminRoles := []string{"admin_all", "admin", "tu", "kepsek"}
	userActionRoles := []string{"super_admin", "tata_usaha", "tu"}

	v1 := e.Group("/api/v1")
	v1.Use(apimw.Auth())
	v1.GET("/me", akun.Me)

	legacy := e.Group("/api")
	legacy.Use(apimw.Auth())
	legacy.Use(markLegacy)
	legacy.GET("/me", akun.Me) // deprecated: alias /api/v1/me

	registerProfiles(v1.Group("/admin"), legacy.Group("/admin"), akun)

	adminV1 := v1.Group("/admin", apimw.RequireRole(legacyAdminRoles...))
	adminLegacy := legacy.Group("/admin", apimw.RequireRole(legacyAdminRoles...))
	registerDashboard(adminV1, adminLegacy, admin)
	registerCRUD(adminV1, adminLegacy, admin)

	userV1 := v1.Group("/admin", apimw.RequireRole(userActionRoles...))
	userLegacy := legacy.Group("/admin", apimw.RequireRole(userActionRoles...))
	userV1.POST("/users", akun.UserAction)
	userLegacy.POST("/users", akun.UserAction) // deprecated: alias /api/v1/admin/users
}

func markLegacy(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Set("legacy", true)
		return next(c)
	}
}

func registerProfiles(v1, legacy *echo.Group, akun *controllers.AkunController) {
	for _, g := range []*echo.Group{v1.Group("/profiles", apimw.RequireRole("admin_all", "admin", "tu", "kepsek")), legacy.Group("/profiles", apimw.RequireRole("admin_all", "admin", "tu", "kepsek"))} {
		g.GET("", func(c echo.Context) error { return akun.ListProfiles(c) })
		g.POST("", func(c echo.Context) error { return akun.CreateProfile(c) })
		g.PUT("/:id", func(c echo.Context) error { return akun.UpdateProfile(c) })
		g.DELETE("/:id", func(c echo.Context) error { return akun.DeleteProfile(c) })
	}
}

func registerDashboard(v1, legacy *echo.Group, admin *controllers.AdminController) {
	v1.GET("/dashboard", admin.Dashboard)
	legacy.GET("/dashboard", admin.Dashboard) // deprecated: alias /api/v1/admin/dashboard
}

func registerCRUD(v1, legacy *echo.Group, admin *controllers.AdminController) {
	resources := []struct {
		name     string
		readOnly bool
	}{
		{"classes", false}, {"jurusan", false}, {"mapel", false},
		{"siswa", false}, {"guru", false}, {"jadwal", false}, {"log", true},
		{"pengumuman", false}, {"presensi", false},
		{"tugas", false}, {"pengumpulan_tugas", false}, {"kuis", false},
		{"tahun_ajaran", false}, {"pengaturan", false},
	}
	for _, resource := range resources {
		rv1 := v1.Group("/" + resource.name)
		rold := legacy.Group("/" + resource.name)
		rv1.GET("", admin.List(resource.name))
		rold.GET("", admin.List(resource.name)) // deprecated: alias /api/v1/admin/{resource}
		rv1.POST("", admin.Create(resource.name))
		rold.POST("", admin.Create(resource.name)) // deprecated: alias /api/v1/admin/{resource}
		if resource.readOnly {
			continue
		}
		rv1.PUT("/:id", admin.Update(resource.name))
		rold.PUT("/:id", admin.Update(resource.name)) // deprecated: alias /api/v1/admin/{resource}
		rv1.DELETE("/:id", admin.Delete(resource.name))
		rold.DELETE("/:id", admin.Delete(resource.name)) // deprecated: alias /api/v1/admin/{resource}
	}
}
