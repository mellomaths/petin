package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
	"github.com/mellomaths/petin/backend/core/internal/domain/auth"
	"go.uber.org/zap"
)

type contextKey string

const AccountIDKey contextKey = "account_id"
const EmailKey contextKey = "email"

func AuthMiddleware(authSvc auth.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "authorization header required", nil)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "invalid authorization header format", nil)
				return
			}

			tokenString := parts[1]
			claims, err := authSvc.ValidateToken(tokenString)
			if err != nil {
				if err == auth.ErrTokenExpired {
					api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "token expired", nil)
					return
				}
				zap.L().Info("invalid token", zap.Error(err))
				api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "invalid token", nil)
				return
			}

			// Add claims to context
			ctx := context.WithValue(r.Context(), AccountIDKey, claims.AccountID)
			ctx = context.WithValue(ctx, EmailKey, claims.Email)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetAccountID retrieves the account ID from the request context
func GetAccountID(r *http.Request) string {
	if accountID, ok := r.Context().Value(AccountIDKey).(string); ok {
		return accountID
	}
	return ""
}

// GetEmail retrieves the email from the request context
func GetEmail(r *http.Request) string {
	if email, ok := r.Context().Value(EmailKey).(string); ok {
		return email
	}
	return ""
}

