// Package auth provides authentication and authorization services.
// It handles user login, token generation, token validation, and token refresh.
package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/domain/accounts"
	"go.uber.org/zap"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidToken       = errors.New("invalid token")
	ErrTokenExpired       = errors.New("token expired")
)

type Service interface {
	Login(ctx context.Context, params LoginParams) (LoginResponse, error)
	RefreshToken(ctx context.Context, params RefreshTokenParams) (LoginResponse, error)
	ValidateToken(tokenString string) (*TokenClaims, error)
}

type svc struct {
	accountsSvc accounts.Service
	repo        repo.Querier
	snowNode    *snowflake.Node
	jwtSecret   []byte
	tokenExpiry time.Duration
}

// NewService creates a new authentication service with the provided dependencies.
func NewService(accountsSvc accounts.Service, repo repo.Querier, snowNode *snowflake.Node, jwtSecret string, tokenExpiry time.Duration) Service {
	return &svc{
		accountsSvc: accountsSvc,
		repo:        repo,
		snowNode:    snowNode,
		jwtSecret:   []byte(jwtSecret),
		tokenExpiry: tokenExpiry,
	}
}

// Login authenticates a user with email and password, returning JWT tokens upon success.
// Returns ErrInvalidCredentials if authentication fails or account is not active.
func (s *svc) Login(ctx context.Context, params LoginParams) (LoginResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	// Get account by email
	account, err := s.repo.GetAccountByEmail(ctx, params.Email)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Info("account not found for login", zap.String("email", params.Email))
			return LoginResponse{}, ErrInvalidCredentials
		}
		logger.Error("failed to get account by email", zap.Error(err))
		return LoginResponse{}, fmt.Errorf("failed to get account by email: %w", err)
	}

	// Verify password
	if !s.accountsSvc.VerifyPassword(params.Password, account.Password) {
		logger.Info("invalid password for login", zap.String("email", params.Email))
		return LoginResponse{}, ErrInvalidCredentials
	}

	// Check if account is active
	if account.Status != string(accounts.AccountStatusActive) {
		logger.Info("account not active", zap.String("account_external_id", account.ExternalID), zap.String("status", account.Status))
		return LoginResponse{}, ErrInvalidCredentials
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(account.ExternalID, account.Email)
	if err != nil {
		zap.L().Error("failed to generate access token", zap.Error(err))
		return LoginResponse{}, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(account.ExternalID, account.Email)
	if err != nil {
		zap.L().Error("failed to generate refresh token", zap.Error(err))
		return LoginResponse{}, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	expiresAt := time.Now().Add(s.tokenExpiry)

	return LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		TokenType:    "Bearer",
	}, nil
}

// RefreshToken generates new access and refresh tokens using a valid refresh token.
// Returns ErrInvalidToken if the refresh token is invalid or the account is not active.
func (s *svc) RefreshToken(ctx context.Context, params RefreshTokenParams) (LoginResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	// Validate refresh token
	claims, err := s.validateRefreshToken(params.RefreshToken)
	if err != nil {
		return LoginResponse{}, err
	}

	// Verify account still exists and is active
	account, err := s.repo.GetAccount(ctx, claims.AccountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Info("account not found for token refresh", zap.String("account_external_id", claims.AccountID))
			return LoginResponse{}, ErrInvalidToken
		}
		logger.Error("failed to get account for token refresh", zap.Error(err), zap.String("account_external_id", claims.AccountID))
		return LoginResponse{}, fmt.Errorf("failed to get account: %w", err)
	}

	if account.Status != string(accounts.AccountStatusActive) {
		logger.Info("account not active for token refresh", zap.String("account_external_id", account.ExternalID))
		return LoginResponse{}, ErrInvalidToken
	}

	// Generate new tokens
	accessToken, err := s.generateAccessToken(account.ExternalID, account.Email)
	if err != nil {
		zap.L().Error("failed to generate access token", zap.Error(err))
		return LoginResponse{}, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(account.ExternalID, account.Email)
	if err != nil {
		zap.L().Error("failed to generate refresh token", zap.Error(err))
		return LoginResponse{}, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	expiresAt := time.Now().Add(s.tokenExpiry)

	return LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
		TokenType:    "Bearer",
	}, nil
}

// ValidateToken validates a JWT token and returns its claims.
// Returns ErrInvalidToken if the token is invalid or ErrTokenExpired if the token has expired.
func (s *svc) ValidateToken(tokenString string) (*TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*TokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

func (s *svc) generateAccessToken(accountID, email string) (string, error) {
	now := time.Now()
	expiresAt := now.Add(s.tokenExpiry)

	claims := &TokenClaims{
		AccountID: accountID,
		Email:     email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *svc) generateRefreshToken(accountID, email string) (string, error) {
	now := time.Now()
	expiresAt := now.Add(7 * 24 * time.Hour) // 7 days for refresh token

	claims := &TokenClaims{
		AccountID: accountID,
		Email:     email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *svc) validateRefreshToken(tokenString string) (*TokenClaims, error) {
	return s.ValidateToken(tokenString)
}
