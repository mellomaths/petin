package accounts

import "time"

type CreateAccountParams struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=32"`
}

type AccountStatus string

const (
	AccountStatusActive    AccountStatus = "ACTIVE"
	AccountStatusInactive  AccountStatus = "INACTIVE"
	AccountStatusPending   AccountStatus = "PENDING"
	AccountStatusSuspended AccountStatus = "SUSPENDED"
	AccountStatusArchived  AccountStatus = "ARCHIVED"
)

type AccountResponse struct {
	ExternalID string        `json:"external_id"`
	Status     AccountStatus `json:"status"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
}
