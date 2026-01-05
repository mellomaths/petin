// Package profiles provides user profile management operations.
// It handles profile creation and retrieval, including address information.
package profiles

import (
	"context"
	"errors"
	"fmt"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/domain/accounts"
	"go.uber.org/zap"
)

var (
	ErrProfileNotFound      = errors.New("profile not found")
	ErrProfileAlreadyExists = errors.New("profile already exists")
	ErrAccountNotActive     = errors.New("account is not active")
)

type Service interface {
	GetProfile(ctx context.Context, accountExternalId string) (ProfileResponse, error)
	CreateProfile(ctx context.Context, accountExternalId string, params CreateProfileParams) (ProfileResponse, error)
}

type svc struct {
	repo     *repo.Queries
	db       *pgx.Conn
	snowNode *snowflake.Node
	validate *validator.Validate
}

// NewService creates a new profiles service with the provided dependencies.
func NewService(repo *repo.Queries, db *pgx.Conn, snowNode *snowflake.Node) Service {
	return &svc{
		repo:     repo,
		db:       db,
		snowNode: snowNode,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// GetProfile retrieves a profile by account external ID.
// Returns ErrProfileNotFound if the profile does not exist.
func (s *svc) GetProfile(ctx context.Context, accountExternalId string) (ProfileResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	profile, err := s.repo.GetProfileByAccountExternalID(ctx, accountExternalId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return ProfileResponse{}, ErrProfileNotFound
		}
		logger.Error("failed to get profile", zap.Error(err), zap.String("account_external_id", accountExternalId))
		return ProfileResponse{}, fmt.Errorf("failed to get profile: %w", err)
	}
	return ProfileResponse{
		ExternalID: profile.ExternalID,
		Account: accounts.AccountResponse{
			ExternalID: profile.AccountExternalID,
			Email:      profile.AccountEmail,
			Status:     accounts.AccountStatus(profile.AccountStatus),
			CreatedAt:  profile.AccountCreatedAt.Time,
			UpdatedAt:  profile.AccountUpdatedAt.Time,
		},
		Fullname:       profile.Fullname,
		DocumentNumber: profile.DocumentNumber,
		DocumentType:   profile.DocumentType,
		Birthdate:      profile.Birthdate.Time,
		Bio:            profile.Bio,
		Gender:         profile.Gender,
		PhoneNumber:    profile.PhoneNumber,
		Address: CreateAddressParams{
			AddressLine:  profile.AddressLine,
			StreetNumber: profile.StreetNumber,
			City:         profile.City,
			State:        profile.State,
			CountryCode:  profile.CountryCode,
			ZipCode:      profile.ZipCode,
			Latitude:     profile.Latitude,
			Longitude:    profile.Longitude,
		},
		Avatar: profile.Avatar.String,
	}, nil
}

// CreateProfile creates a new profile for an account.
// The account must be active. Returns ErrAccountNotActive if the account is not active,
// or ErrProfileAlreadyExists if a profile already exists for the account.
func (s *svc) CreateProfile(ctx context.Context, accountExternalId string, params CreateProfileParams) (ProfileResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	// Validate request body
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return ProfileResponse{}, err
	}
	externalID := s.snowNode.Generate().String()
	account, err := s.repo.GetAccount(ctx, accountExternalId)
	if err != nil {
		if err == pgx.ErrNoRows {
			return ProfileResponse{}, accounts.ErrAccountNotFound
		}
		return ProfileResponse{}, fmt.Errorf("failed to get account: %w", err)
	}
	if account.Status != string(accounts.AccountStatusActive) {
		return ProfileResponse{}, ErrAccountNotActive
	}
	_, err = s.repo.GetProfileByAccountExternalID(ctx, accountExternalId)
	if err == nil {
		return ProfileResponse{}, ErrProfileAlreadyExists
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return ProfileResponse{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)
	qtx := s.repo.WithTx(tx)
	address, err := qtx.CreateAddress(ctx, repo.CreateAddressParams{
		ExternalID:   externalID,
		AddressLine:  params.Address.AddressLine,
		StreetNumber: params.Address.StreetNumber,
		City:         params.Address.City,
		State:        params.Address.State,
		CountryCode:  params.Address.CountryCode,
		ZipCode:      params.Address.ZipCode,
		Latitude:     params.Address.Latitude,
		Longitude:    params.Address.Longitude,
	})
	if err != nil {
		return ProfileResponse{}, fmt.Errorf("failed to create address: %w", err)
	}
	profile, err := qtx.CreateProfile(ctx, repo.CreateProfileParams{
		ExternalID:     externalID,
		AccountID:      account.ID,
		Fullname:       params.Fullname,
		DocumentNumber: params.DocumentNumber,
		DocumentType:   params.DocumentType,
		Birthdate:      pgtype.Date{Time: params.Birthdate, Valid: true},
		Bio:            params.Bio,
		Gender:         params.Gender,
		PhoneNumber:    params.PhoneNumber,
		AddressID:      address.ID,
		Avatar:         pgtype.Text{String: params.Avatar, Valid: true},
	})
	if err != nil {
		return ProfileResponse{}, fmt.Errorf("failed to create profile: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return ProfileResponse{}, fmt.Errorf("failed to commit transaction: %w", err)
	}
	return ProfileResponse{
		ExternalID: profile.ExternalID,
		Account: accounts.AccountResponse{
			ExternalID: accountExternalId,
			Email:      account.Email,
			Status:     accounts.AccountStatus(account.Status),
			CreatedAt:  account.CreatedAt.Time,
			UpdatedAt:  account.UpdatedAt.Time,
		},
		Fullname:       profile.Fullname,
		DocumentNumber: profile.DocumentNumber,
		DocumentType:   profile.DocumentType,
		Birthdate:      profile.Birthdate.Time,
		Bio:            profile.Bio,
		Gender:         profile.Gender,
		PhoneNumber:    profile.PhoneNumber,
		Avatar:         profile.Avatar.String,
		Address: CreateAddressParams{
			AddressLine:  address.AddressLine,
			StreetNumber: address.StreetNumber,
			City:         address.City,
			State:        address.State,
			CountryCode:  address.CountryCode,
			ZipCode:      address.ZipCode,
			Latitude:     address.Latitude,
			Longitude:    address.Longitude,
		},
	}, nil
}
