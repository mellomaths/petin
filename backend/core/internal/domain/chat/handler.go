package chat

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
	chatSvc Service
	repo    repo.Querier
}

func NewHandler(chatSvc Service, repo repo.Querier) *handler {
	return &handler{chatSvc: chatSvc, repo: repo}
}

func (h *handler) CreateConversation(w http.ResponseWriter, r *http.Request) {
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

	var params CreateConversationParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	conversation, err := h.chatSvc.CreateConversation(r.Context(), profileRow.ID, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		zap.L().Error("failed to create conversation", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusCreated, conversation)
}

func (h *handler) GetConversation(w http.ResponseWriter, r *http.Request) {
	externalID := chi.URLParam(r, "externalId")
	conversation, err := h.chatSvc.GetConversation(r.Context(), externalID)
	if err != nil {
		if errors.Is(err, ErrConversationNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "conversation not found", nil)
			return
		}
		zap.L().Error("failed to get conversation", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, conversation)
}

func (h *handler) GetConversations(w http.ResponseWriter, r *http.Request) {
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

	conversations, err := h.chatSvc.GetConversationsByProfileID(r.Context(), profileRow.ID)
	if err != nil {
		zap.L().Error("failed to get conversations", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, conversations)
}

func (h *handler) CreateMessage(w http.ResponseWriter, r *http.Request) {
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
	// Get conversation from database to get ID
	conv, err := h.repo.GetConversation(r.Context(), externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "conversation not found", nil)
			return
		}
		zap.L().Error("failed to get conversation", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	var params CreateMessageParams
	if err := api.DecodeJsonBody(r, &params); err != nil {
		zap.L().Info("failed to decode json body", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", nil)
		return
	}

	// Verify user is part of conversation
	if conv.AdopterProfileID != profileRow.ID && conv.OwnerProfileID != profileRow.ID {
		api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
		return
	}

	message, err := h.chatSvc.CreateMessage(r.Context(), conv.ID, profileRow.ID, params)
	if err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := api.FormatValidationErrors(validationErrors)
			api.NewJsonErrorResponse(w, http.StatusBadRequest, string(schemas.ErrorCodeInvalidBody), "invalid request", errors)
			return
		}
		if errors.Is(err, ErrConversationNotFound) {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "conversation not found", nil)
			return
		}
		if errors.Is(err, ErrUnauthorized) {
			api.NewJsonErrorResponse(w, http.StatusForbidden, string(schemas.ErrorCodeUnauthorized), "unauthorized", nil)
			return
		}
		zap.L().Error("failed to create message", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusCreated, message)
}

func (h *handler) GetMessages(w http.ResponseWriter, r *http.Request) {
	externalID := chi.URLParam(r, "externalId")
	// Get conversation from database to get ID
	conv, err := h.repo.GetConversation(r.Context(), externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			api.NewJsonErrorResponse(w, http.StatusNotFound, string(schemas.ErrorCodeNotFound), "conversation not found", nil)
			return
		}
		zap.L().Error("failed to get conversation", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	messages, err := h.chatSvc.GetMessagesByConversationID(r.Context(), conv.ID)
	if err != nil {
		zap.L().Error("failed to get messages", zap.Error(err))
		api.NewJsonErrorResponse(w, http.StatusInternalServerError, string(schemas.ErrorCodeInternalServerError), "internal server error", nil)
		return
	}

	api.NewJsonResponse(w, http.StatusOK, messages)
}

func (h *handler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
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
	// WebSocket server should be initialized in api.go and passed here
	// For now, this is a placeholder - WebSocket integration will be added when server is set up
	zap.L().Info("websocket connection attempt", zap.String("conversation_id", externalID), zap.Int64("profile_id", profileRow.ID))
	api.NewJsonErrorResponse(w, http.StatusNotImplemented, "NOT_IMPLEMENTED", "websocket not yet implemented", nil)
}

