package accounts

import (
	"context"
	"errors"

	"github.com/bwmarrin/snowflake"
	validator "github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrAccountAlreadyExists = errors.New("account already exists")
	ErrAccountNotFound      = errors.New("account not found")
)

type Service interface {
	CreateAccount(ctx context.Context, params CreateAccountParams) (AccountResponse, error)
	HashPassword(password string) (string, error)
	VerifyPassword(password, hash string) bool
	GetAccount(ctx context.Context, externalId string) (AccountResponse, error)
	UpdateAccountStatus(ctx context.Context, externalId string, params UpdateAccountStatusParams) (AccountResponse, error)
}

type svc struct {
	repo     repo.Querier
	snowNode *snowflake.Node
}

func NewService(repo repo.Querier, snowNode *snowflake.Node) Service {
	return &svc{repo: repo, snowNode: snowNode}
}

func (s *svc) CreateAccount(ctx context.Context, params CreateAccountParams) (AccountResponse, error) {
	externalID := s.snowNode.Generate().String()
	// Validate request body
	validate := validator.New(validator.WithRequiredStructEnabled())
	if err := validate.Struct(params); err != nil {
		zap.L().Info("invalid request body", zap.Error(err))
		return AccountResponse{}, err
	}
	// Check if account already exists
	account, err := s.repo.GetAccountByEmail(ctx, params.Email)
	if err == nil {
		zap.L().Info("account already exists", zap.String("account_external_id", account.ExternalID))
		return AccountResponse{}, ErrAccountAlreadyExists
	}
	if err != pgx.ErrNoRows {
		zap.L().Error("failed to get account by email", zap.Error(err))
		return AccountResponse{}, errors.New("failed to get account by email")
	}
	// Hash password
	hashedPassword, err := s.HashPassword(params.Password)
	if err != nil {
		zap.L().Error("failed to hash password", zap.Error(err))
		return AccountResponse{}, errors.New("failed to hash password")
	}
	account, err = s.repo.CreateAccount(ctx, repo.CreateAccountParams{
		ExternalID: externalID,
		Email:      params.Email,
		Password:   hashedPassword,
		Status:     string(AccountStatusPending),
	})
	if err != nil {
		zap.L().Error("failed to create account", zap.Error(err))
		return AccountResponse{}, errors.New("failed to create account")
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
		return "", err
	}
	return string(hashedPassword), nil
}

func (s *svc) VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *svc) GetAccount(ctx context.Context, externalId string) (AccountResponse, error) {
	account, err := s.repo.GetAccount(ctx, externalId)
	if err != nil {
		if err == pgx.ErrNoRows {
			zap.L().Info("account not found", zap.String("account_external_id", externalId))
			return AccountResponse{}, ErrAccountNotFound
		}
		zap.L().Error("failed to get account by external id", zap.Error(err))
		return AccountResponse{}, errors.New("failed to get account by external id")
	}
	return AccountResponse{
		ExternalID: account.ExternalID,
		Email:      account.Email,
		Status:     AccountStatus(account.Status),
		CreatedAt:  account.CreatedAt.Time,
		UpdatedAt:  account.UpdatedAt.Time,
	}, nil
}

func (s *svc) UpdateAccountStatus(ctx context.Context, externalId string, params UpdateAccountStatusParams) (AccountResponse, error) {
	validate := validator.New(validator.WithRequiredStructEnabled())
	if err := validate.Struct(params); err != nil {
		zap.L().Info("invalid request body", zap.Error(err))
		return AccountResponse{}, err
	}
	account, err := s.repo.UpdateAccountStatus(ctx, repo.UpdateAccountStatusParams{
		ExternalID: externalId,
		Status:     string(params.Status),
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			zap.L().Info("account not found", zap.String("account_external_id", externalId))
			return AccountResponse{}, ErrAccountNotFound
		}
		zap.L().Error("failed to update account status", zap.Error(err))
		return AccountResponse{}, errors.New("failed to update account status")
	}
	return AccountResponse{
		ExternalID: account.ExternalID,
		Email:      account.Email,
		Status:     AccountStatus(account.Status),
		CreatedAt:  account.CreatedAt.Time,
		UpdatedAt:  account.UpdatedAt.Time,
	}, nil
}
