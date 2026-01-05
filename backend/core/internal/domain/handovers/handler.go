package handovers

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/api/middleware"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
	"go.uber.org/zap"
)

type handler struct {
	handoversSvc Service
	repo         repo.Querier
}

func NewHandler(handoversSvc Service, repo repo.Querier) *handler {
	return &handler{handoversSvc: handoversSvc, repo: repo}
}

func (h *handler) CreateHandover(w http.ResponseWriter, r *http.Request) {
	accountID := middleware.GetAccountID(r)
	if accountID == "" {
		api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
		return
	}

	// Get profile for this account
	profileRow, err := h.repo.GetProfileByAccountExternalID(r.Context(), accountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	conversationID := chi.URLParam(r, "conversationId")
	var params CreateHandoverParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	params.ConversationExternalID = conversationID
	handover, err := h.handoversSvc.CreateHandover(r.Context(), profileRow.ID, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to create handover", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusCreated, handover)
}

func (h *handler) GetHandover(w http.ResponseWriter, r *http.Request) {
	externalID := chi.URLParam(r, "externalId")
	handover, err := h.handoversSvc.GetHandover(r.Context(), externalID)
	if err != nil {
		if errors.Is(err, ErrHandoverNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "handover not found", nil)
			return
		}
		zap.L().Error("failed to get handover", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, handover)
}

func (h *handler) UpdateHandoverLocation(w http.ResponseWriter, r *http.Request) {
	accountID := middleware.GetAccountID(r)
	if accountID == "" {
		api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
		return
	}

	// Get profile for this account
	profileRow, err := h.repo.GetProfileByAccountExternalID(r.Context(), accountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	externalID := chi.URLParam(r, "externalId")
	var params UpdateHandoverLocationParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	handover, err := h.handoversSvc.UpdateHandoverLocation(r.Context(), externalID, profileRow.ID, params)
	if err != nil {
		if errors.Is(err, ErrHandoverNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "handover not found", nil)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to update handover location", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, handover)
}

func (h *handler) UpdateHandoverScheduledDate(w http.ResponseWriter, r *http.Request) {
	accountID := middleware.GetAccountID(r)
	if accountID == "" {
		api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
		return
	}

	// Get profile for this account
	profileRow, err := h.repo.GetProfileByAccountExternalID(r.Context(), accountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	externalID := chi.URLParam(r, "externalId")
	var params UpdateHandoverScheduledDateParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	handover, err := h.handoversSvc.UpdateHandoverScheduledDate(r.Context(), externalID, profileRow.ID, params)
	if err != nil {
		if errors.Is(err, ErrHandoverNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "handover not found", nil)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to update handover scheduled date", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, handover)
}

func (h *handler) ConfirmHandover(w http.ResponseWriter, r *http.Request) {
	accountID := middleware.GetAccountID(r)
	if accountID == "" {
		api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
		return
	}

	// Get profile for this account
	profileRow, err := h.repo.GetProfileByAccountExternalID(r.Context(), accountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	externalID := chi.URLParam(r, "externalId")
	handover, err := h.handoversSvc.ConfirmHandover(r.Context(), externalID, profileRow.ID)
	if err != nil {
		if errors.Is(err, ErrHandoverNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "handover not found", nil)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to confirm handover", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, handover)
}

func (h *handler) CancelHandover(w http.ResponseWriter, r *http.Request) {
	accountID := middleware.GetAccountID(r)
	if accountID == "" {
		api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
		return
	}

	// Get profile for this account
	profileRow, err := h.repo.GetProfileByAccountExternalID(r.Context(), accountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	externalID := chi.URLParam(r, "externalId")
	handover, err := h.handoversSvc.CancelHandover(r.Context(), externalID, profileRow.ID)
	if err != nil {
		if errors.Is(err, ErrHandoverNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "handover not found", nil)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to cancel handover", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, handover)
}

func (h *handler) GetHandovers(w http.ResponseWriter, r *http.Request) {
	accountID := middleware.GetAccountID(r)
	if accountID == "" {
		api.NewJsonErrorResponse(w, http.StatusUnauthorized, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
		return
	}

	// Get profile for this account
	profileRow, err := h.repo.GetProfileByAccountExternalID(r.Context(), accountID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	handovers, err := h.handoversSvc.GetHandoversByProfileID(r.Context(), profileRow.ID)
	if err != nil {
		zap.L().Error("failed to get handovers", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, handovers)
}

