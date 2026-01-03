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

func (h *handler) CreateAccount(w http.ResponseWriter, r *http.Request) {
	var params CreateAccountParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
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
		zap.L().Error("failed to create account", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusCreated, account)
}

func (h *handler) GetAccount(w http.ResponseWriter, r *http.Request) {
	externalId := chi.URLParam(r, "externalId")
	account, err := h.accountsSvc.GetAccount(r.Context(), externalId)
	if err != nil {
		if errors.Is(err, ErrAccountNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "account not found", nil)
			return
		}
		zap.L().Error("failed to get account by external id", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusOK, account)
}

func (h *handler) ActivateAccount(w http.ResponseWriter, r *http.Request) {
	externalId := chi.URLParam(r, "externalId")
	account, err := h.accountsSvc.ActivateAccount(r.Context(), externalId)
	if err != nil {
		if errors.Is(err, ErrAccountNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "account not found", nil)
			return
		}
		zap.L().Error("failed to activate account", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusOK, account)
}
