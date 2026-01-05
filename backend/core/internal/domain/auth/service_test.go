package auth

import (
	"context"
	"testing"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/domain/accounts"
	"github.com/mellomaths/petin/backend/core/test"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// MockAccountsService is a mock implementation of accounts.Service
type MockAccountsService struct {
	mock.Mock
}

func (m *MockAccountsService) CreateAccount(ctx context.Context, params accounts.CreateAccountParams) (accounts.AccountResponse, error) {
	args := m.Called(ctx, params)
	return args.Get(0).(accounts.AccountResponse), args.Error(1)
}

func (m *MockAccountsService) HashPassword(password string) (string, error) {
	args := m.Called(password)
	return args.String(0), args.Error(1)
}

func (m *MockAccountsService) VerifyPassword(password, hash string) bool {
	args := m.Called(password, hash)
	return args.Bool(0)
}

func (m *MockAccountsService) GetAccount(ctx context.Context, externalId string) (accounts.AccountResponse, error) {
	args := m.Called(ctx, externalId)
	return args.Get(0).(accounts.AccountResponse), args.Error(1)
}

func (m *MockAccountsService) UpdateAccountStatus(ctx context.Context, externalId string, params accounts.UpdateAccountStatusParams) (accounts.AccountResponse, error) {
	args := m.Called(ctx, externalId, params)
	return args.Get(0).(accounts.AccountResponse), args.Error(1)
}

func (m *MockAccountsService) VerifyEmail(ctx context.Context, externalId string) (accounts.AccountResponse, error) {
	args := m.Called(ctx, externalId)
	return args.Get(0).(accounts.AccountResponse), args.Error(1)
}

func TestService_Login(t *testing.T) {
	tests := []struct {
		name          string
		params        LoginParams
		mockSetup     func(*test.MockQuerier, *MockAccountsService)
		expectedError error
	}{
		{
			name: "successful login",
			params: LoginParams{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockSetup: func(mockRepo *test.MockQuerier, mockAccounts *MockAccountsService) {
				mockRepo.On("GetAccountByEmail", mock.Anything, "test@example.com").Return(repo.PetinAccount{
					ExternalID: "account-id",
					Email:      "test@example.com",
					Password:   "hashed-password",
					Status:     string(accounts.AccountStatusActive),
				}, nil)
				mockAccounts.On("VerifyPassword", "password123", "hashed-password").Return(true)
			},
			expectedError: nil,
		},
		{
			name: "account not found",
			params: LoginParams{
				Email:    "notfound@example.com",
				Password: "password123",
			},
			mockSetup: func(mockRepo *test.MockQuerier, mockAccounts *MockAccountsService) {
				mockRepo.On("GetAccountByEmail", mock.Anything, "notfound@example.com").Return(repo.PetinAccount{}, pgx.ErrNoRows)
			},
			expectedError: ErrInvalidCredentials,
		},
		{
			name: "invalid password",
			params: LoginParams{
				Email:    "test@example.com",
				Password: "wrongpassword",
			},
			mockSetup: func(mockRepo *test.MockQuerier, mockAccounts *MockAccountsService) {
				mockRepo.On("GetAccountByEmail", mock.Anything, "test@example.com").Return(repo.PetinAccount{
					ExternalID: "account-id",
					Email:      "test@example.com",
					Password:   "hashed-password",
					Status:     string(accounts.AccountStatusActive),
				}, nil)
				mockAccounts.On("VerifyPassword", "wrongpassword", "hashed-password").Return(false)
			},
			expectedError: ErrInvalidCredentials,
		},
		{
			name: "account not active",
			params: LoginParams{
				Email:    "pending@example.com",
				Password: "password123",
			},
			mockSetup: func(mockRepo *test.MockQuerier, mockAccounts *MockAccountsService) {
				mockRepo.On("GetAccountByEmail", mock.Anything, "pending@example.com").Return(repo.PetinAccount{
					ExternalID: "account-id",
					Email:      "pending@example.com",
					Password:   "hashed-password",
					Status:     string(accounts.AccountStatusPending),
				}, nil)
				mockAccounts.On("VerifyPassword", "password123", "hashed-password").Return(true)
			},
			expectedError: ErrInvalidCredentials,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			mockAccounts := new(MockAccountsService)
			tt.mockSetup(mockRepo, mockAccounts)

			snowNode, _ := snowflake.NewNode(1)
			service := NewService(mockAccounts, mockRepo, snowNode, "test-secret-key", 24*time.Hour)

			result, err := service.Login(context.Background(), tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
				assert.Empty(t, result.AccessToken)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.AccessToken)
				assert.NotEmpty(t, result.RefreshToken)
				assert.Equal(t, "Bearer", result.TokenType)
			}

			mockRepo.AssertExpectations(t)
			mockAccounts.AssertExpectations(t)
		})
	}
}

func TestService_RefreshToken(t *testing.T) {
	mockRepo := new(test.MockQuerier)
	mockAccounts := new(MockAccountsService)
	snowNode, _ := snowflake.NewNode(1)
	service := NewService(mockAccounts, mockRepo, snowNode, "test-secret-key", 24*time.Hour)

	// First create a valid token by logging in
	mockRepo.On("GetAccountByEmail", mock.Anything, "test@example.com").Return(repo.PetinAccount{
		ExternalID: "account-id",
		Email:      "test@example.com",
		Password:   "hashed-password",
		Status:     string(accounts.AccountStatusActive),
	}, nil)
	mockAccounts.On("VerifyPassword", "password123", "hashed-password").Return(true)

	loginResp, err := service.Login(context.Background(), LoginParams{
		Email:    "test@example.com",
		Password: "password123",
	})
	require.NoError(t, err)
	require.NotEmpty(t, loginResp.RefreshToken)

	// Now test refresh
	mockRepo.On("GetAccount", mock.Anything, "account-id").Return(repo.PetinAccount{
		ExternalID: "account-id",
		Email:      "test@example.com",
		Status:     string(accounts.AccountStatusActive),
	}, nil)

	result, err := service.RefreshToken(context.Background(), RefreshTokenParams{
		RefreshToken: loginResp.RefreshToken,
	})

	assert.NoError(t, err)
	assert.NotEmpty(t, result.AccessToken)
	assert.NotEmpty(t, result.RefreshToken)

	mockRepo.AssertExpectations(t)
	mockAccounts.AssertExpectations(t)
}

func TestService_ValidateToken(t *testing.T) {
	snowNode, _ := snowflake.NewNode(1)
	service := NewService(nil, nil, snowNode, "test-secret-key", 24*time.Hour)

	// Generate a valid token
	accountID := "test-account-id"
	email := "test@example.com"
	token, err := service.(*svc).generateAccessToken(accountID, email)
	require.NoError(t, err)

	tests := []struct {
		name          string
		tokenString   string
		expectedError error
	}{
		{
			name:          "valid token",
			tokenString:   token,
			expectedError: nil,
		},
		{
			name:          "invalid token",
			tokenString:   "invalid-token",
			expectedError: ErrInvalidToken,
		},
		{
			name:          "empty token",
			tokenString:   "",
			expectedError: ErrInvalidToken,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := service.ValidateToken(tt.tokenString)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
				assert.Nil(t, claims)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, claims)
				assert.Equal(t, accountID, claims.AccountID)
				assert.Equal(t, email, claims.Email)
			}
		})
	}
}

