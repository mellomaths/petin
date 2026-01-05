package chat

import (
	"context"
	"testing"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/test"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestService_CreateConversation(t *testing.T) {
	tests := []struct {
		name          string
		adopterID     int64
		params        CreateConversationParams
		mockSetup     func(*test.MockQuerier)
		expectedError bool
	}{
		{
			name:      "successful conversation creation",
			adopterID: 2,
			params: CreateConversationParams{
				PetExternalID:    "pet-id",
				AdopterProfileID: 2,
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetPet", mock.Anything, "pet-id").Return(repo.PetinPet{
					ID:        1,
					ProfileID: 1, // Owner
				}, nil)
				mockRepo.On("CreateConversation", mock.Anything, mock.MatchedBy(func(arg repo.CreateConversationParams) bool {
					return arg.PetID == 1 && arg.AdopterProfileID == 2 && arg.OwnerProfileID == 1
				})).Return(repo.PetinConversation{
					ExternalID:        "conv-id",
					PetID:            1,
					AdopterProfileID: 2,
					OwnerProfileID:   1,
					CreatedAt:        pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: false,
		},
		{
			name:      "pet not found",
			adopterID: 2,
			params: CreateConversationParams{
				PetExternalID:    "non-existent",
				AdopterProfileID: 2,
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetPet", mock.Anything, "non-existent").Return(repo.PetinPet{}, pgx.ErrNoRows)
			},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.CreateConversation(context.Background(), tt.adopterID, tt.params)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
				assert.Equal(t, tt.adopterID, result.AdopterProfileID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_CreateMessage(t *testing.T) {
	tests := []struct {
		name          string
		conversationID int64
		senderID      int64
		params        CreateMessageParams
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:          "successful message creation",
			conversationID: 1,
			senderID:      2,
			params: CreateMessageParams{
				Content: "Hello!",
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetConversationByID", mock.Anything, int64(1)).Return(repo.PetinConversation{
					ID:                1,
					AdopterProfileID: 2,
					OwnerProfileID:   1,
				}, nil)
				mockRepo.On("CreateMessage", mock.Anything, mock.MatchedBy(func(arg repo.CreateMessageParams) bool {
					return arg.ConversationID == 1 && arg.SenderProfileID == 2 && arg.Content == "Hello!"
				})).Return(repo.PetinMessage{
					ExternalID:      "msg-id",
					ConversationID:  1,
					SenderProfileID: 2,
					Content:        "Hello!",
					CreatedAt:      pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:          "unauthorized sender",
			conversationID: 1,
			senderID:      99, // Not part of conversation
			params: CreateMessageParams{
				Content: "Hello!",
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetConversationByID", mock.Anything, int64(1)).Return(repo.PetinConversation{
					ID:                1,
					AdopterProfileID: 2,
					OwnerProfileID:   1,
				}, nil)
			},
			expectedError: ErrUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.CreateMessage(context.Background(), tt.conversationID, tt.senderID, tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
				assert.Equal(t, tt.params.Content, result.Content)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_GetMessagesByConversationID(t *testing.T) {
	tests := []struct {
		name          string
		conversationID int64
		mockSetup     func(*test.MockQuerier)
		expectedCount int
		expectedError bool
	}{
		{
			name:          "successful get messages",
			conversationID: 1,
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetMessagesByConversationID", mock.Anything, int64(1)).Return([]repo.PetinMessage{
					{
						ExternalID:      "msg-1",
						ConversationID:  1,
						SenderProfileID: 1,
						Content:        "Hello",
						CreatedAt:       pgtype.Timestamp{Time: time.Now(), Valid: true},
					},
					{
						ExternalID:      "msg-2",
						ConversationID:  1,
						SenderProfileID: 2,
						Content:        "Hi there",
						CreatedAt:       pgtype.Timestamp{Time: time.Now().Add(time.Minute), Valid: true},
					},
				}, nil)
			},
			expectedCount: 2,
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.GetMessagesByConversationID(context.Background(), tt.conversationID)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Len(t, result, tt.expectedCount)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

