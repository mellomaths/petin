package api

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

// GetRequestID retrieves the request ID from the request context.
// Returns empty string if not found.
func GetRequestID(r *http.Request) string {
	if reqID := r.Context().Value(middleware.RequestIDKey); reqID != nil {
		if id, ok := reqID.(string); ok {
			return id
		}
	}
	return ""
}

// GetRequestIDFromContext retrieves the request ID from context.
// Returns empty string if not found.
func GetRequestIDFromContext(ctx context.Context) string {
	if reqID := ctx.Value(middleware.RequestIDKey); reqID != nil {
		if id, ok := reqID.(string); ok {
			return id
		}
	}
	return ""
}

// LogWithRequestID returns a zap logger with request ID field if available.
func LogWithRequestID(r *http.Request) *zap.Logger {
	reqID := GetRequestID(r)
	if reqID != "" {
		return zap.L().With(zap.String("request_id", reqID))
	}
	return zap.L()
}

// LogWithRequestIDFromContext returns a zap logger with request ID field if available.
func LogWithRequestIDFromContext(ctx context.Context) *zap.Logger {
	reqID := GetRequestIDFromContext(ctx)
	if reqID != "" {
		return zap.L().With(zap.String("request_id", reqID))
	}
	return zap.L()
}
