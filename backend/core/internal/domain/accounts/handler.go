package accounts

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
	"go.uber.org/zap"
)

type handler struct {
	accountsSvc Service
}

func NewHandler(accountsSvc Service) *handler {
	return &handler{accountsSvc: accountsSvc}
}

// CreateAccount handles HTTP requests to create a new account.
func (h *handler) CreateAccount(w http.ResponseWriter, r *http.Request) {
	logger := api.LogWithRequestID(r)
	var params CreateAccountParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		logger.Debug("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid account", nil)
		return
	}
	account, err := h.accountsSvc.CreateAccount(r.Context(), params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid account", errors)
			return
		}
		if errors.Is(err, ErrAccountAlreadyExists) {
			api.NewJsonErrorResponse(w, http.StatusConflict, string(schemas.ErrorCodeConflict), "email already in use", nil)
			return
		}
		logger.Error("failed to create account", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusCreated, account)
}

// GetAccount handles HTTP requests to retrieve an account by external ID.
func (h *handler) GetAccount(w http.ResponseWriter, r *http.Request) {
	logger := api.LogWithRequestID(r)
	externalId := chi.URLParam(r, "externalId")
	account, err := h.accountsSvc.GetAccount(r.Context(), externalId)
	if err != nil {
		if errors.Is(err, ErrAccountNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "account not found", nil)
			return
		}
		logger.Error("failed to get account by external id", zap.Error(err), zap.String("external_id", externalId))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusOK, account)
}

// UpdateAccountStatus handles HTTP requests to update an account's status.
func (h *handler) UpdateAccountStatus(w http.ResponseWriter, r *http.Request) {
	logger := api.LogWithRequestID(r)
	externalId := chi.URLParam(r, "externalId")
	var params UpdateAccountStatusParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		logger.Debug("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid account", nil)
		return
	}
	account, err := h.accountsSvc.UpdateAccountStatus(r.Context(), externalId, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid status", errors)
			return
		}
		if errors.Is(err, ErrAccountNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "account not found", nil)
			return
		}
		logger.Error("failed to update account status", zap.Error(err), zap.String("external_id", externalId))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusOK, account)
}

func (h *handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	externalId := chi.URLParam(r, "externalId")
	account, err := h.accountsSvc.VerifyEmail(r.Context(), externalId)
	if err != nil {
		if errors.Is(err, ErrAccountNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "account not found", nil)
			return
		}
		zap.L().Error("failed to verify email", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "failed to verify email", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusOK, account)
}