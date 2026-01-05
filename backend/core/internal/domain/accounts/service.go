// Package accounts provides account management operations.
// It handles account creation, retrieval, status updates, email verification,
// and password hashing/verification.
package accounts

import (
	"context"
	"errors"
	"fmt"

	"github.com/bwmarrin/snowflake"
	validator "github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrAccountAlreadyExists = errors.New("account already exists")
	ErrAccountNotFound      = errors.New("account not found")
	ErrAccountCannotVerify  = errors.New("account cannot be verified")
)

type Service interface {
	CreateAccount(ctx context.Context, params CreateAccountParams) (AccountResponse, error)
	HashPassword(password string) (string, error)
	VerifyPassword(password, hash string) bool
	GetAccount(ctx context.Context, externalId string) (AccountResponse, error)
	UpdateAccountStatus(ctx context.Context, externalId string, params UpdateAccountStatusParams) (AccountResponse, error)
	VerifyEmail(ctx context.Context, externalId string) (AccountResponse, error)
}

type svc struct {
	repo     repo.Querier
	snowNode *snowflake.Node
	validate *validator.Validate
}

// NewService creates a new accounts service with the provided dependencies.
func NewService(repo repo.Querier, snowNode *snowflake.Node) Service {
	return &svc{
		repo:     repo,
		snowNode: snowNode,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// CreateAccount creates a new user account with the provided email and password.
// It validates the input, checks for duplicates, hashes the password, and stores
// the account in the database. Returns an error if validation fails or the account
// already exists.
func (s *svc) CreateAccount(ctx context.Context, params CreateAccountParams) (AccountResponse, error) {
	externalID := s.snowNode.Generate().String()
	logger := api.LogWithRequestIDFromContext(ctx)
	
	// Validate request body
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return AccountResponse{}, err
	}
	// Check if account already exists
	account, err := s.repo.GetAccountByEmail(ctx, params.Email)
	if err == nil {
		logger.Info("account already exists", zap.String("account_external_id", account.ExternalID))
		return AccountResponse{}, ErrAccountAlreadyExists
	}
	if err != pgx.ErrNoRows {
		logger.Error("failed to get account by email", zap.Error(err))
		return AccountResponse{}, fmt.Errorf("failed to get account by email: %w", err)
	}
	// Hash password
	hashedPassword, err := s.HashPassword(params.Password)
	if err != nil {
		logger.Error("failed to hash password", zap.Error(err))
		return AccountResponse{}, fmt.Errorf("failed to hash password: %w", err)
	}
	account, err = s.repo.CreateAccount(ctx, repo.CreateAccountParams{
		ExternalID: externalID,
		Email:      params.Email,
		Password:   hashedPassword,
		Status:     string(AccountStatusPending),
	})
	if err != nil {
		logger.Error("failed to create account", zap.Error(err))
		return AccountResponse{}, fmt.Errorf("failed to create account: %w", err)
	}
	return AccountResponse{
		ExternalID: account.ExternalID,
		Email:      account.Email,
		Status:     AccountStatus(account.Status),
		CreatedAt:  account.CreatedAt.Time,
		UpdatedAt:  account.UpdatedAt.Time,
	}, nil
}

func (s *svc) HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		zap.L().Error("failed to hash password", zap.Error(err))
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

// VerifyPassword verifies a password against a bcrypt hash.
// Returns true if the password matches the hash, false otherwise.
func (s *svc) VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GetAccount retrieves an account by its external ID.
// Returns ErrAccountNotFound if the account does not exist.
func (s *svc) GetAccount(ctx context.Context, externalId string) (AccountResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	account, err := s.repo.GetAccount(ctx, externalId)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Info("account not found", zap.String("account_external_id", externalId))
			return AccountResponse{}, ErrAccountNotFound
		}
		logger.Error("failed to get account by external id", zap.Error(err), zap.String("account_external_id", externalId))
		return AccountResponse{}, fmt.Errorf("failed to get account by external id: %w", err)
	}
	return AccountResponse{
		ExternalID: account.ExternalID,
		Email:      account.Email,
		Status:     AccountStatus(account.Status),
		CreatedAt:  account.CreatedAt.Time,
		UpdatedAt:  account.UpdatedAt.Time,
	}, nil
}

// UpdateAccountStatus updates the status of an account.
// Returns ErrAccountNotFound if the account does not exist.
func (s *svc) UpdateAccountStatus(ctx context.Context, externalId string, params UpdateAccountStatusParams) (AccountResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return AccountResponse{}, err
	}
	account, err := s.repo.UpdateAccountStatus(ctx, repo.UpdateAccountStatusParams{
		ExternalID: externalId,
		Status:     string(params.Status),
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Info("account not found", zap.String("account_external_id", externalId))
			return AccountResponse{}, ErrAccountNotFound
		}
		logger.Error("failed to update account status", zap.Error(err), zap.String("account_external_id", externalId))
		return AccountResponse{}, fmt.Errorf("failed to update account status: %w", err)
	}
	return AccountResponse{
		ExternalID: account.ExternalID,
		Email:      account.Email,
		Status:     AccountStatus(account.Status),
		CreatedAt:  account.CreatedAt.Time,
		UpdatedAt:  account.UpdatedAt.Time,
	}, nil
}

// VerifyEmail verifies an account's email address by updating its status from PENDING to ACTIVE.
// Only accounts with PENDING status can be verified. Returns ErrAccountNotFound if the account
// does not exist, or ErrAccountCannotVerify if the account is not in PENDING status.
func (s *svc) VerifyEmail(ctx context.Context, externalId string) (AccountResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	account, err := s.repo.GetAccount(ctx, externalId)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Info("account not found for email verification", zap.String("account_external_id", externalId))
			return AccountResponse{}, ErrAccountNotFound
		}
		logger.Error("failed to get account for email verification", zap.Error(err), zap.String("account_external_id", externalId))
		return AccountResponse{}, fmt.Errorf("failed to get account: %w", err)
	}

	// Only allow verification if account is pending
	if account.Status != string(AccountStatusPending) {
		logger.Info("account already verified or invalid status", zap.String("account_external_id", externalId), zap.String("status", account.Status))
		return AccountResponse{}, ErrAccountCannotVerify
	}

	// Update status to active
	account, err = s.repo.UpdateAccountStatus(ctx, repo.UpdateAccountStatusParams{
		ExternalID: externalId,
		Status:     string(AccountStatusActive),
	})
	if err != nil {
		logger.Error("failed to update account status for email verification", zap.Error(err), zap.String("account_external_id", externalId))
		return AccountResponse{}, fmt.Errorf("failed to verify email: %w", err)
	}

	return AccountResponse{
		ExternalID: account.ExternalID,
		Email:      account.Email,
		Status:     AccountStatus(account.Status),
		CreatedAt:  account.CreatedAt.Time,
		UpdatedAt:  account.UpdatedAt.Time,
	}, nil
}
