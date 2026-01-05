package handovers

import (
	"context"
	"testing"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgtype"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/test"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestService_CreateHandover(t *testing.T) {
	tests := []struct {
		name          string
		ownerID       int64
		params        CreateHandoverParams
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:    "successful handover creation",
			ownerID: 1,
			params: CreateHandoverParams{
				ConversationExternalID: "conv-id",
				ScheduledDate:          timePtr(time.Now().Add(24 * time.Hour)),
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetConversation", mock.Anything, "conv-id").Return(repo.PetinConversation{
					ID:                1,
					PetID:            1,
					OwnerProfileID:   1,
					AdopterProfileID: 2,
				}, nil)
				mockRepo.On("GetPetByID", mock.Anything, int64(1)).Return(repo.PetinPet{
					ID:        1,
					ProfileID: 1,
				}, nil)
				mockRepo.On("CreateHandover", mock.Anything, mock.MatchedBy(func(arg repo.CreateHandoverParams) bool {
					return arg.OwnerProfileID == 1 && arg.AdopterProfileID == 2 && arg.PetID == 1
				})).Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					ConversationID:    1,
					PetID:            1,
					OwnerProfileID:   1,
					AdopterProfileID: 2,
					Status:           string(HandoverStatusScheduled),
					CreatedAt:        pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:    "unauthorized - not owner",
			ownerID: 99, // Not the owner
			params: CreateHandoverParams{
				ConversationExternalID: "conv-id",
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetConversation", mock.Anything, "conv-id").Return(repo.PetinConversation{
					ID:                1,
					PetID:            1,
					OwnerProfileID:   1, // Different owner
					AdopterProfileID: 2,
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
			result, err := service.CreateHandover(context.Background(), tt.ownerID, tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
				assert.Equal(t, tt.ownerID, result.OwnerProfileID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_ConfirmHandover(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		profileID     int64
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "owner confirms",
			externalID: "handover-id",
			profileID:  1,
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetHandover", mock.Anything, "handover-id").Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					PetID:            1,
					OwnerProfileID:   1,
					AdopterProfileID: 2,
					OwnerConfirmed:   false,
					AdopterConfirmed: false,
					Status:           string(HandoverStatusPending),
				}, nil)
				mockRepo.On("ConfirmHandover", mock.Anything, mock.MatchedBy(func(arg repo.ConfirmHandoverParams) bool {
					return arg.OwnerConfirmed == true && arg.AdopterConfirmed == false
				})).Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					OwnerConfirmed:   true,
					AdopterConfirmed: false,
					Status:           string(HandoverStatusPending),
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "both confirm - handover completed",
			externalID: "handover-id",
			profileID:  2, // Adopter
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetHandover", mock.Anything, "handover-id").Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					PetID:            1,
					OwnerProfileID:   1,
					AdopterProfileID: 2,
					OwnerConfirmed:   true, // Already confirmed
					AdopterConfirmed: false,
					Status:           string(HandoverStatusPending),
				}, nil)
				mockRepo.On("GetPetByID", mock.Anything, int64(1)).Return(repo.PetinPet{
					ID:        1,
					ExternalID: "pet-id",
				}, nil)
				mockRepo.On("UpdatePetAvailability", mock.Anything, mock.Anything).Return(repo.PetinPet{}, nil)
				mockRepo.On("UpdatePetCurrentOwner", mock.Anything, mock.Anything).Return(repo.PetinPet{}, nil)
				mockRepo.On("ConfirmHandover", mock.Anything, mock.MatchedBy(func(arg repo.ConfirmHandoverParams) bool {
					return arg.OwnerConfirmed == true && arg.AdopterConfirmed == true && arg.Status == string(HandoverStatusCompleted)
				})).Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					OwnerConfirmed:   true,
					AdopterConfirmed: true,
					Status:           string(HandoverStatusCompleted),
					CompletedAt:      pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.ConfirmHandover(context.Background(), tt.externalID, tt.profileID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_UpdateHandoverLocation(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		profileID     int64
		params        UpdateHandoverLocationParams
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "owner updates location",
			externalID: "handover-id",
			profileID:  1,
			params: UpdateHandoverLocationParams{
				LocationName:   stringPtr("New Location"),
				LocationAddress: stringPtr("123 Main St"),
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetHandover", mock.Anything, "handover-id").Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					OwnerProfileID:   1,
					AdopterProfileID: 2,
				}, nil)
				mockRepo.On("UpdateHandoverLocation", mock.Anything, mock.Anything).Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					LocationName:     pgtype.Text{String: "New Location", Valid: true},
					LocationAddress:  pgtype.Text{String: "123 Main St", Valid: true},
					LocationChangeRequested: false,
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "adopter requests location change",
			externalID: "handover-id",
			profileID:  2, // Adopter
			params: UpdateHandoverLocationParams{
				RequestChange:          true,
				LocationChangeProposal: stringPtr("Can we meet at a different location?"),
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetHandover", mock.Anything, "handover-id").Return(repo.PetinHandover{
					ExternalID:        "handover-id",
					OwnerProfileID:   1,
					AdopterProfileID: 2,
				}, nil)
				mockRepo.On("UpdateHandoverLocation", mock.Anything, mock.MatchedBy(func(arg repo.UpdateHandoverLocationParams) bool {
					return arg.LocationChangeRequested == true
				})).Return(repo.PetinHandover{
					ExternalID:              "handover-id",
					LocationChangeRequested: true,
					LocationChangeRequestedBy: pgtype.Int8{Int64: 2, Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.UpdateHandoverLocation(context.Background(), tt.externalID, tt.profileID, tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

// Helper function
func timePtr(t time.Time) *time.Time {
	return &t
}

func stringPtr(s string) *string {
	return &s
}

