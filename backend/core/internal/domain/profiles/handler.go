package profiles

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
	"github.com/mellomaths/petin/backend/core/internal/domain/accounts"
	"go.uber.org/zap"
)

type handler struct {
	profilesSvc Service
}

func NewHandler(profilesSvc Service) *handler {
	return &handler{profilesSvc: profilesSvc}
}

func (h *handler) CreateProfile(w http.ResponseWriter, r *http.Request) {
	accountExternalId := chi.URLParam(r, "externalId")
	var params CreateProfileParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid profile", nil)
		return
	}
	profile, err := h.profilesSvc.CreateProfile(r.Context(), accountExternalId, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid profile", errors)
			return
		}
		if errors.Is(err, ErrProfileAlreadyExists) {
			api.NewJsonErrorResponse(w, http.StatusConflict, string(schemas.ErrorCodeConflict), "profile already exists", nil)
			return
		}
		if errors.Is(err, accounts.ErrAccountNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "account not found", nil)
			return
		}
		if errors.Is(err, ErrAccountNotActive) {
			api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "account is not active", nil)
			return
		}
		zap.L().Error("failed to create profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusCreated, profile)
}

func (h *handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	accountExternalId := chi.URLParam(r, "externalId")
	profile, err := h.profilesSvc.GetProfile(r.Context(), accountExternalId)
	if err != nil {
		if errors.Is(err, ErrProfileNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}
	api.NewJsonResponse(w, http.StatusOK, profile)
}
