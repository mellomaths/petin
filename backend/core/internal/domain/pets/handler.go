package pets

import (
	"errors"
	"net/http"
	"strconv"

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
	petsSvc Service
	repo    repo.Querier
}

func NewHandler(petsSvc Service, repo repo.Querier) *handler {
	return &handler{petsSvc: petsSvc, repo: repo}
}

func (h *handler) CreatePet(w http.ResponseWriter, r *http.Request) {
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
	profileID := profileRow.ID

	var params CreatePetParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	pet, err := h.petsSvc.CreatePet(r.Context(), profileID, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		zap.L().Error("failed to create pet", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusCreated, pet)
}

func (h *handler) GetPet(w http.ResponseWriter, r *http.Request) {
	externalID := chi.URLParam(r, "externalId")
	pet, err := h.petsSvc.GetPet(r.Context(), externalID)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "pet not found", nil)
			return
		}
		zap.L().Error("failed to get pet", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, pet)
}

func (h *handler) UpdatePet(w http.ResponseWriter, r *http.Request) {
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
	profileID := profileRow.ID

	externalID := chi.URLParam(r, "externalId")
	var params UpdatePetParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	pet, err := h.petsSvc.UpdatePet(r.Context(), externalID, profileID, params)
	if err != nil {
		if errors.Is(err, ErrPetNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "pet not found", nil)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to update pet", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, pet)
}

func (h *handler) UpdatePetAvailability(w http.ResponseWriter, r *http.Request) {
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
	profileID := profileRow.ID

	externalID := chi.URLParam(r, "externalId")
	var params UpdatePetAvailabilityParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	pet, err := h.petsSvc.UpdatePetAvailability(r.Context(), externalID, profileID, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		if errors.Is(err, ErrPetNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "pet not found", nil)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to update pet availability", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, pet)
}

func (h *handler) GetPetsByProfile(w http.ResponseWriter, r *http.Request) {
	externalID := chi.URLParam(r, "externalId")
	
	// Get profile for this account
	profileRow, err := h.repo.GetProfileByAccountExternalID(r.Context(), externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "profile not found", nil)
			return
		}
		zap.L().Error("failed to get profile", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	pets, err := h.petsSvc.GetPetsByProfileID(r.Context(), profileRow.ID)
	if err != nil {
		zap.L().Error("failed to get pets", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, pets)
}

func (h *handler) GetNearbyPets(w http.ResponseWriter, r *http.Request) {
	latStr := r.URL.Query().Get("lat")
	lngStr := r.URL.Query().Get("lng")
	radiusStr := r.URL.Query().Get("radius")
	limitStr := r.URL.Query().Get("limit")

	if latStr == "" || lngStr == "" {
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "latitude and longitude are required", nil)
		return
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid latitude", nil)
		return
	}

	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid longitude", nil)
		return
	}

	params := NearbyPetsParams{
		Latitude:  lat,
		Longitude: lng,
	}

	if radiusStr != "" {
		radius, err := strconv.ParseFloat(radiusStr, 64)
		if err == nil {
			params.Radius = radius
		}
	}

	if limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err == nil && limit > 0 {
			params.Limit = limit
		}
	}

	pets, err := h.petsSvc.GetNearbyPets(r.Context(), params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		zap.L().Error("failed to get nearby pets", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, pets)
}

