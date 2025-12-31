package accounts

import (
	"context"
	"errors"

	"github.com/bwmarrin/snowflake"
	validator "github.com/go-playground/validator/v10"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"go.uber.org/zap"
)

type Service interface {
	CreateAccount(ctx context.Context, params CreateAccountParams) (CreateAccountResponse, error)
}

type svc struct {
	repo     repo.Querier
	snowNode *snowflake.Node
}

func NewService(repo repo.Querier, snowNode *snowflake.Node) Service {
	return &svc{repo: repo, snowNode: snowNode}
}

func (s *svc) CreateAccount(ctx context.Context, params CreateAccountParams) (CreateAccountResponse, error) {
	externalID := s.snowNode.Generate().String()
	// Validate request body
	validate := validator.New(validator.WithRequiredStructEnabled())
	if err := validate.Struct(params); err != nil {
		zap.L().Info("invalid request body", zap.Error(err))
		return CreateAccountResponse{}, err
	}
	// TODO: Hash password
	account, err := s.repo.CreateAccount(ctx, repo.CreateAccountParams{
		ExternalID: externalID,
		Email:      params.Email,
		Password:   params.Password,
		Status:     string(AccountStatusActive),
	})
	if err != nil {
		zap.L().Error("failed to create account", zap.Error(err))
		return CreateAccountResponse{}, errors.New("failed to create account")
	}
	return CreateAccountResponse{
		ExternalID: account.ExternalID,
		Status:     AccountStatus(account.Status),
		CreatedAt:  account.CreatedAt.Time,
		UpdatedAt:  account.UpdatedAt.Time,
	}, nil
}
