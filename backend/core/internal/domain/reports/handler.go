package reports

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
	reportsSvc Service
	repo       repo.Querier
}

func NewHandler(reportsSvc Service, repo repo.Querier) *handler {
	return &handler{reportsSvc: reportsSvc, repo: repo}
}

func (h *handler) CreateReport(w http.ResponseWriter, r *http.Request) {
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

	var params CreateReportParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	report, err := h.reportsSvc.CreateReport(r.Context(), profileRow.ID, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		if errors.Is(err, ErrCannotReportSelf) {
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "cannot report yourself", nil)
			return
		}
		zap.L().Error("failed to create report", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusCreated, report)
}

func (h *handler) GetReport(w http.ResponseWriter, r *http.Request) {
	externalID := chi.URLParam(r, "externalId")
	report, err := h.reportsSvc.GetReport(r.Context(), externalID)
	if err != nil {
		if errors.Is(err, ErrReportNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "report not found", nil)
			return
		}
		zap.L().Error("failed to get report", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, report)
}

