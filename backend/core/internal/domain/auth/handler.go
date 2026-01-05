package auth

import (
	"errors"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
	"go.uber.org/zap"
)

type handler struct {
	authSvc Service
}

func NewHandler(authSvc Service) *handler {
	return &handler{authSvc: authSvc}
}

func (h *handler) Login(w http.ResponseWriter, r *http.Request) {
	var params LoginParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	response, err := h.authSvc.Login(r.Context(), params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		if errors.Is(err, ErrInvalidCredentials) {
			api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "invalid credentials", nil)
			return
		}
		zap.L().Error("failed to login", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, response)
}

func (h *handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var params RefreshTokenParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	response, err := h.authSvc.RefreshToken(r.Context(), params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		if errors.Is(err, ErrInvalidToken) || errors.Is(err, ErrTokenExpired) {
			api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "invalid or expired token", nil)
			return
		}
		zap.L().Error("failed to refresh token", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, response)
}

