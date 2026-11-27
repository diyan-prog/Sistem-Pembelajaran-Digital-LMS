package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	Pool *pgxpool.Pool
}

func NewDB(dbURL string) (*DB, error) {
	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return nil, err
	}
	return &DB{Pool: pool}, nil
}

func (d *DB) Close() { d.Pool.Close() }

// formatUUID menulis UUID 16 byte menjadi bentuk teks standar.
func formatUUID(b [16]byte) string {
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// normalizeValue membuat nilai kolom aman di-encode JSON oleh Echo.
// Tanpa ini UUID tampil sebagai larik byte dan kolom time tampil
// sebagai objek pgtype.
func normalizeValue(v interface{}) interface{} {
	switch t := v.(type) {
	case [16]byte:
		return formatUUID(t)
	case pgtype.UUID:
		if !t.Valid {
			return nil
		}
		return formatUUID(t.Bytes)
	case pgtype.Time:
		if !t.Valid {
			return nil
		}
		us := t.Microseconds
		return fmt.Sprintf("%02d:%02d:%02d",
			us/3_600_000_000, (us%3_600_000_000)/60_000_000, (us%60_000_000)/1_000_000)
	case pgtype.Numeric:
		if !t.Valid {
			return nil
		}
		f, err := t.Float64Value()
		if err != nil || !f.Valid {
			return nil
		}
		return f.Float64
	case pgtype.Date:
		if !t.Valid {
			return nil
		}
		return t.Time.Format("2006-01-02")
	case pgtype.Timestamp:
		if !t.Valid {
			return nil
		}
		return t.Time.UTC()
	case pgtype.Timestamptz:
		if !t.Valid {
			return nil
		}
		return t.Time.UTC()
	case time.Time:
		return t.UTC()
	case []byte:
		return string(t)
	}
	return v
}

func rowMap(fields []string, values []interface{}) map[string]interface{} {
	row := make(map[string]interface{}, len(fields))
	for i, name := range fields {
		row[name] = normalizeValue(values[i])
	}
	return row
}

// List mengembalikan baris dalam bentuk map kolom -> nilai.
func (d *DB) List(ctx context.Context, query string, args ...interface{}) ([]map[string]interface{}, error) {
	rows, err := d.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	fields := rows.FieldDescriptions()
	result := make([]map[string]interface{}, 0)
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, err
		}
		names := make([]string, len(fields))
		for i, field := range fields {
			names[i] = string(field.Name)
		}
		result = append(result, rowMap(names, values))
	}
	return result, rows.Err()
}

func (d *DB) Exec(ctx context.Context, query string, args ...interface{}) error {
	_, err := d.Pool.Exec(ctx, query, args...)
	return err
}

func (d *DB) Count(ctx context.Context, query string, args ...interface{}) (int, error) {
	var count int
	err := d.Pool.QueryRow(ctx, query, args...).Scan(&count)
	return count, err
}

// One mengembalikan satu baris hasil query dalam bentuk map kolom -> nilai.
func (d *DB) One(ctx context.Context, query string, args ...interface{}) (map[string]interface{}, error) {
	rows, err := d.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	fields := rows.FieldDescriptions()
	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return nil, err
		}
		return nil, fmt.Errorf("query tidak mengembalikan baris")
	}
	values, err := rows.Values()
	if err != nil {
		return nil, err
	}
	names := make([]string, len(fields))
	for i, field := range fields {
		names[i] = string(field.Name)
	}
	return rowMap(names, values), nil
}

// nullable mengembalikan nil jika string kosong (untuk kolom NULL).
func nullable(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

// nullableInt mengembalikan nil jika nilai 0 (untuk kolom NULL).
func nullableInt(n int) interface{} {
	if n == 0 {
		return nil
	}
	return n
}
