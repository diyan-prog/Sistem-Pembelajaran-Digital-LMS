package services

import "errors"

var (
	ErrValidation = errors.New("validation error")
	ErrNotFound   = errors.New("not found")
	ErrConflict   = errors.New("conflict")
)

type DomainError struct {
	Kind    error
	Message string
}

func (e *DomainError) Error() string { return e.Message }
func (e *DomainError) Unwrap() error { return e.Kind }

func Validation(msg string) error { return &DomainError{Kind: ErrValidation, Message: msg} }
func NotFound(msg string) error   { return &DomainError{Kind: ErrNotFound, Message: msg} }
func Conflict(msg string) error   { return &DomainError{Kind: ErrConflict, Message: msg} }
