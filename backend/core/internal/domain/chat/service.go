// Package chat provides conversation and messaging functionality.
// It handles conversation creation between pet owners and adopters,
// message creation and retrieval within conversations.
package chat

import (
	"context"
	"errors"
	"fmt"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"go.uber.org/zap"
)

var (
	ErrConversationNotFound = errors.New("conversation not found")
	ErrUnauthorized         = errors.New("unauthorized")
)

type Service interface {
	CreateConversation(ctx context.Context, adopterProfileID int64, params CreateConversationParams) (ConversationResponse, error)
	GetConversation(ctx context.Context, externalID string) (ConversationResponse, error)
	GetConversationsByProfileID(ctx context.Context, profileID int64) ([]ConversationResponse, error)
	CreateMessage(ctx context.Context, conversationID int64, senderProfileID int64, params CreateMessageParams) (MessageResponse, error)
	GetMessagesByConversationID(ctx context.Context, conversationID int64) ([]MessageResponse, error)
}

type svc struct {
	repo     repo.Querier
	snowNode *snowflake.Node
	validate *validator.Validate
}

// NewService creates a new chat service with the provided dependencies.
func NewService(repo repo.Querier, snowNode *snowflake.Node) Service {
	return &svc{
		repo:     repo,
		snowNode: snowNode,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// CreateConversation creates a new conversation between an adopter and a pet owner.
// Returns an error if validation fails, the pet is not found, or the conversation cannot be created.
func (s *svc) CreateConversation(ctx context.Context, adopterProfileID int64, params CreateConversationParams) (ConversationResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return ConversationResponse{}, err
	}

	// Get pet to find owner
	pet, err := s.repo.GetPet(ctx, params.PetExternalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return ConversationResponse{}, fmt.Errorf("pet not found: %w", err)
		}
		return ConversationResponse{}, fmt.Errorf("failed to get pet: %w", err)
	}

	// Get owner profile ID from pet's profile_id
	ownerProfileID := pet.ProfileID

	externalID := s.snowNode.Generate().String()
	conversation, err := s.repo.CreateConversation(ctx, repo.CreateConversationParams{
		ExternalID:        externalID,
		PetID:             pet.ID,
		AdopterProfileID: adopterProfileID,
		OwnerProfileID:   ownerProfileID,
	})
	if err != nil {
		logger.Error("failed to create conversation", zap.Error(err), zap.Int64("adopter_profile_id", adopterProfileID))
		return ConversationResponse{}, fmt.Errorf("failed to create conversation: %w", err)
	}

	return ConversationResponse{
		ExternalID:        conversation.ExternalID,
		PetID:            conversation.PetID,
		AdopterProfileID: conversation.AdopterProfileID,
		OwnerProfileID:   conversation.OwnerProfileID,
		CreatedAt:        conversation.CreatedAt.Time,
	}, nil
}

// GetConversation retrieves a conversation by its external ID.
// Returns ErrConversationNotFound if the conversation does not exist.
func (s *svc) GetConversation(ctx context.Context, externalID string) (ConversationResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	conversation, err := s.repo.GetConversation(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return ConversationResponse{}, ErrConversationNotFound
		}
		logger.Error("failed to get conversation", zap.Error(err), zap.String("conversation_external_id", externalID))
		return ConversationResponse{}, fmt.Errorf("failed to get conversation: %w", err)
	}

	return ConversationResponse{
		ExternalID:        conversation.ExternalID,
		PetID:            conversation.PetID,
		AdopterProfileID: conversation.AdopterProfileID,
		OwnerProfileID:   conversation.OwnerProfileID,
		CreatedAt:        conversation.CreatedAt.Time,
	}, nil
}

// GetConversationsByProfileID retrieves all conversations for a given profile.
func (s *svc) GetConversationsByProfileID(ctx context.Context, profileID int64) ([]ConversationResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	conversations, err := s.repo.GetConversationsByProfileID(ctx, profileID)
	if err != nil {
		logger.Error("failed to get conversations", zap.Error(err), zap.Int64("profile_id", profileID))
		return nil, fmt.Errorf("failed to get conversations: %w", err)
	}

	result := make([]ConversationResponse, len(conversations))
	for i, conv := range conversations {
		result[i] = ConversationResponse{
			ExternalID:        conv.ExternalID,
			PetID:            conv.PetID,
			AdopterProfileID: conv.AdopterProfileID,
			OwnerProfileID:   conv.OwnerProfileID,
			CreatedAt:        conv.CreatedAt.Time,
		}
	}

	return result, nil
}

// CreateMessage creates a new message in a conversation.
// Returns ErrUnauthorized if the sender is not part of the conversation.
func (s *svc) CreateMessage(ctx context.Context, conversationID int64, senderProfileID int64, params CreateMessageParams) (MessageResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return MessageResponse{}, err
	}

	// Verify conversation exists and user is part of it
	conversation, err := s.repo.GetConversationByID(ctx, conversationID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return MessageResponse{}, ErrConversationNotFound
		}
		return MessageResponse{}, fmt.Errorf("failed to get conversation: %w", err)
	}

	// Check if sender is part of conversation
	if conversation.AdopterProfileID != senderProfileID && conversation.OwnerProfileID != senderProfileID {
		return MessageResponse{}, ErrUnauthorized
	}

	externalID := s.snowNode.Generate().String()
	message, err := s.repo.CreateMessage(ctx, repo.CreateMessageParams{
		ExternalID:      externalID,
		ConversationID: conversationID,
		SenderProfileID: senderProfileID,
		Content:         params.Content,
	})
	if err != nil {
		logger.Error("failed to create message", zap.Error(err), zap.Int64("conversation_id", conversationID), zap.Int64("sender_profile_id", senderProfileID))
		return MessageResponse{}, fmt.Errorf("failed to create message: %w", err)
	}

	return MessageResponse{
		ExternalID:      message.ExternalID,
		ConversationID: message.ConversationID,
		SenderProfileID: message.SenderProfileID,
		Content:        message.Content,
		CreatedAt:      message.CreatedAt.Time,
	}, nil
}

// GetMessagesByConversationID retrieves all messages for a given conversation.
func (s *svc) GetMessagesByConversationID(ctx context.Context, conversationID int64) ([]MessageResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	messages, err := s.repo.GetMessagesByConversationID(ctx, conversationID)
	if err != nil {
		logger.Error("failed to get messages", zap.Error(err), zap.Int64("conversation_id", conversationID))
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}

	result := make([]MessageResponse, len(messages))
	for i, msg := range messages {
		result[i] = MessageResponse{
			ExternalID:      msg.ExternalID,
			ConversationID: msg.ConversationID,
			SenderProfileID: msg.SenderProfileID,
			Content:        msg.Content,
			CreatedAt:      msg.CreatedAt.Time,
		}
	}

	return result, nil
}

