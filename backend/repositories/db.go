package repositories

import (
	"context"
	"fmt"

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
		row := make(map[string]interface{}, len(fields))
		for i, field := range fields {
			row[string(field.Name)] = values[i]
		}
		result = append(result, row)
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
	row := make(map[string]interface{}, len(fields))
	for i, field := range fields {
		row[string(field.Name)] = values[i]
	}
	return row, nil
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
