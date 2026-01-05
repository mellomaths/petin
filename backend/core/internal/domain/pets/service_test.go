package pets

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

func TestService_CreatePet(t *testing.T) {
	tests := []struct {
		name          string
		profileID     int64
		params        CreatePetParams
		mockSetup     func(*test.MockQuerier)
		expectedError bool
	}{
		{
			name:      "successful pet creation",
			profileID: 1,
			params: CreatePetParams{
				Name:                  "Fluffy",
				Species:               "Cat",
				Breed:                 stringPtr("Persian"),
				Age:                   intPtr(3),
				Gender:                stringPtr("Female"),
				Size:                  stringPtr("Medium"),
				Description:           "A friendly cat",
				Photos:                []string{"photo1.jpg"},
				IsAvailableForAdoption: true,
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("CreatePet", mock.Anything, mock.MatchedBy(func(arg repo.CreatePetParams) bool {
					return arg.Name == "Fluffy" && arg.Species == "Cat" && arg.ProfileID == 1
				})).Return(repo.PetinPet{
					ExternalID:            "pet-id",
					ProfileID:             1,
					Name:                  "Fluffy",
					Species:               "Cat",
					Breed:                 pgtype.Text{String: "Persian", Valid: true},
					Age:                   pgtype.Int4{Int32: 3, Valid: true},
					Gender:                pgtype.Text{String: "Female", Valid: true},
					Size:                  pgtype.Text{String: "Medium", Valid: true},
					Description:           pgtype.Text{String: "A friendly cat", Valid: true},
					Photos:                []string{"photo1.jpg"},
					IsAvailableForAdoption: true,
					CurrentOwnerProfileID: pgtype.Int8{Int64: 1, Valid: true},
					CreatedAt:             pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: false,
		},
		{
			name:      "missing required fields",
			profileID: 1,
			params: CreatePetParams{
				Name:        "",
				Species:     "",
				Description: "",
			},
			mockSetup:     func(mockRepo *test.MockQuerier) {},
			expectedError: true, // validation error
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.CreatePet(context.Background(), tt.profileID, tt.params)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
				assert.Equal(t, tt.params.Name, result.Name)
				assert.Equal(t, tt.params.Species, result.Species)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_GetPet(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "successful get pet",
			externalID: "pet-id",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetPet", mock.Anything, "pet-id").Return(repo.PetinPet{
					ExternalID:            "pet-id",
					ProfileID:             1,
					Name:                  "Fluffy",
					Species:               "Cat",
					IsAvailableForAdoption: true,
					CreatedAt:             pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "pet not found",
			externalID: "non-existent",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetPet", mock.Anything, "non-existent").Return(repo.PetinPet{}, pgx.ErrNoRows)
			},
			expectedError: ErrPetNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.GetPet(context.Background(), tt.externalID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.externalID, result.ExternalID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_UpdatePetAvailability(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		profileID     int64
		params        UpdatePetAvailabilityParams
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "successful availability update",
			externalID: "pet-id",
			profileID:  1,
			params: UpdatePetAvailabilityParams{
				IsAvailableForAdoption: false, // Explicitly set to false
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetPet", mock.Anything, "pet-id").Return(repo.PetinPet{
					ExternalID: "pet-id",
					ProfileID:  1,
					Name:       "Fluffy",
					Species:    "Cat",
					Description: pgtype.Text{String: "Test", Valid: true},
					Photos:     []string{},
					CreatedAt:  pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
				mockRepo.On("UpdatePetAvailability", mock.Anything, mock.Anything).Return(repo.PetinPet{
					ExternalID:            "pet-id",
					ProfileID:             1,
					Name:                  "Fluffy",
					Species:               "Cat",
					Description:           pgtype.Text{String: "Test", Valid: true},
					Photos:                []string{},
					IsAvailableForAdoption: false,
					UpdatedAt:             pgtype.Timestamp{Time: time.Now(), Valid: true},
					CreatedAt:             pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "unauthorized update",
			externalID: "pet-id",
			profileID:  2, // Different profile
			params: UpdatePetAvailabilityParams{
				IsAvailableForAdoption: false, // Explicitly set to false
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetPet", mock.Anything, "pet-id").Return(repo.PetinPet{
					ExternalID: "pet-id",
					ProfileID:  1, // Owned by profile 1
					Name:       "Fluffy",
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
			result, err := service.UpdatePetAvailability(context.Background(), tt.externalID, tt.profileID, tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.params.IsAvailableForAdoption, result.IsAvailableForAdoption)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_GetNearbyPets(t *testing.T) {
	tests := []struct {
		name          string
		params        NearbyPetsParams
		mockSetup     func(*test.MockQuerier)
		expectedError bool
		expectedCount int
	}{
		{
			name: "successful nearby pets search",
			params: NearbyPetsParams{
				Latitude:  -23.5505,
				Longitude: -46.6333,
				Radius:    10.0,
				Limit:     10,
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetAvailablePetsNearby", mock.Anything, mock.Anything).Return([]repo.GetAvailablePetsNearbyRow{
					{
						ID:                     1,
						ExternalID:            "pet-1",
						Name:                  "Fluffy",
						Species:               "Cat",
						IsAvailableForAdoption: true,
						OwnerName:             "John",
						OwnerLatitude:         -23.5505,
						OwnerLongitude:        -46.6333,
						Distance:              0.5,
						CreatedAt:             pgtype.Timestamp{Time: time.Now(), Valid: true},
					},
				}, nil)
			},
			expectedError: false,
			expectedCount: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.GetNearbyPets(context.Background(), tt.params)

			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Len(t, result, tt.expectedCount)
				if tt.expectedCount > 0 {
					assert.NotEmpty(t, result[0].ExternalID)
					assert.NotZero(t, result[0].Distance)
				}
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

// Helper functions
func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}

