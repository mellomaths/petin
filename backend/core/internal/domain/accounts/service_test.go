package accounts

import (
	"context"
	"testing"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/test"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)


func TestService_CreateAccount(t *testing.T) {
	tests := []struct {
		name          string
		params        CreateAccountParams
		mockSetup     func(*test.MockQuerier, *snowflake.Node)
		expectedError error
	}{
		{
			name: "successful account creation",
			params: CreateAccountParams{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockSetup: func(mockRepo *test.MockQuerier, snowNode *snowflake.Node) {
				mockRepo.On("GetAccountByEmail", mock.Anything, "test@example.com").Return(repo.PetinAccount{}, pgx.ErrNoRows)
				mockRepo.On("CreateAccount", mock.Anything, mock.MatchedBy(func(arg repo.CreateAccountParams) bool {
					return arg.Email == "test@example.com" && arg.Status == "PENDING" && arg.ExternalID != ""
				})).Return(repo.PetinAccount{
					Email:      "test@example.com",
					Status:     "PENDING",
					CreatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
					UpdatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name: "account already exists",
			params: CreateAccountParams{
				Email:    "existing@example.com",
				Password: "password123",
			},
			mockSetup: func(mockRepo *test.MockQuerier, snowNode *snowflake.Node) {
				mockRepo.On("GetAccountByEmail", mock.Anything, "existing@example.com").Return(repo.PetinAccount{
					ExternalID: "existing-id",
					Email:      "existing@example.com",
				}, nil)
			},
			expectedError: ErrAccountAlreadyExists,
		},
		{
			name: "invalid email format",
			params: CreateAccountParams{
				Email:    "invalid-email",
				Password: "password123",
			},
			mockSetup:     func(mockRepo *test.MockQuerier, snowNode *snowflake.Node) {},
			expectedError: nil, // validation error, not our custom error
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			snowNode, _ := snowflake.NewNode(1)
			tt.mockSetup(mockRepo, snowNode)

			service := NewService(mockRepo, snowNode)
			result, err := service.CreateAccount(context.Background(), tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
				assert.Empty(t, result)
			} else if err != nil {
				// Validation error case
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
				assert.Equal(t, tt.params.Email, result.Email)
				assert.Equal(t, AccountStatusPending, result.Status)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_GetAccount(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "successful get account",
			externalID: "test-id",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetAccount", mock.Anything, "test-id").Return(repo.PetinAccount{
					ExternalID: "test-id",
					Email:      "test@example.com",
					Status:     string(AccountStatusActive),
					CreatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
					UpdatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "account not found",
			externalID: "non-existent",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetAccount", mock.Anything, "non-existent").Return(repo.PetinAccount{}, pgx.ErrNoRows)
			},
			expectedError: ErrAccountNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.GetAccount(context.Background(), tt.externalID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
				assert.Empty(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.externalID, result.ExternalID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_UpdateAccountStatus(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		params        UpdateAccountStatusParams
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "successful status update",
			externalID: "test-id",
			params: UpdateAccountStatusParams{
				Status: AccountStatusActive,
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("UpdateAccountStatus", mock.Anything, mock.MatchedBy(func(arg repo.UpdateAccountStatusParams) bool {
					return arg.ExternalID == "test-id" && arg.Status == string(AccountStatusActive)
				})).Return(repo.PetinAccount{
					ExternalID: "test-id",
					Email:      "test@example.com",
					Status:     string(AccountStatusActive),
					CreatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
					UpdatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "account not found",
			externalID: "non-existent",
			params: UpdateAccountStatusParams{
				Status: AccountStatusActive,
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("UpdateAccountStatus", mock.Anything, mock.Anything).Return(repo.PetinAccount{}, pgx.ErrNoRows)
			},
			expectedError: ErrAccountNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.UpdateAccountStatus(context.Background(), tt.externalID, tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.params.Status, result.Status)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_VerifyEmail(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "successful email verification",
			externalID: "test-id",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetAccount", mock.Anything, "test-id").Return(repo.PetinAccount{
					ExternalID: "test-id",
					Email:      "test@example.com",
					Status:     string(AccountStatusPending),
				}, nil)
				mockRepo.On("UpdateAccountStatus", mock.Anything, mock.MatchedBy(func(arg repo.UpdateAccountStatusParams) bool {
					return arg.ExternalID == "test-id" && arg.Status == string(AccountStatusActive)
				})).Return(repo.PetinAccount{
					ExternalID: "test-id",
					Email:      "test@example.com",
					Status:     string(AccountStatusActive),
					CreatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
					UpdatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "account not found",
			externalID: "non-existent",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetAccount", mock.Anything, "non-existent").Return(repo.PetinAccount{}, pgx.ErrNoRows)
			},
			expectedError: ErrAccountNotFound,
		},
		{
			name:       "account already verified",
			externalID: "test-id",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetAccount", mock.Anything, "test-id").Return(repo.PetinAccount{
					ExternalID: "test-id",
					Status:     string(AccountStatusActive),
				}, nil)
			},
			expectedError: nil, // Returns error but not ErrAccountNotFound
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.VerifyEmail(context.Background(), tt.externalID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else if err != nil && tt.name == "account already verified" {
				// Expected error for already verified
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, AccountStatusActive, result.Status)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_HashPassword(t *testing.T) {
	snowNode, _ := snowflake.NewNode(1)
	service := NewService(nil, snowNode)

	password := "testpassword123"
	hash, err := service.HashPassword(password)

	require.NoError(t, err)
	require.NotEmpty(t, hash)
	require.NotEqual(t, password, hash)
}

func TestService_VerifyPassword(t *testing.T) {
	snowNode, _ := snowflake.NewNode(1)
	service := NewService(nil, snowNode)

	password := "testpassword123"
	hash, err := service.HashPassword(password)
	require.NoError(t, err)

	tests := []struct {
		name     string
		password string
		hash     string
		expected bool
	}{
		{
			name:     "correct password",
			password: password,
			hash:     hash,
			expected: true,
		},
		{
			name:     "incorrect password",
			password: "wrongpassword",
			hash:     hash,
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := service.VerifyPassword(tt.password, tt.hash)
			assert.Equal(t, tt.expected, result)
		})
	}
}

