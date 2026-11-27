package authz

import "testing"

func TestRoleMatches(t *testing.T) {
	cases := []struct {
		role, want string
		ok         bool
	}{
		{"super_admin", "admin_all", true},
		{"super_admin", "admin", true},
		{"super_admin", "tu", true},
		{"kepala_sekolah", "kepsek", true},
		{"guru", "admin", false},
	}
	for _, c := range cases {
		if got := RoleMatches(c.role, c.want); got != c.ok {
			t.Errorf("RoleMatches(%q,%q)=%v want %v", c.role, c.want, got, c.ok)
		}
	}
}
