// Package pets provides pet management operations.
// It handles pet creation, retrieval, updates, availability management,
// and nearby pet search functionality.
package pets

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"go.uber.org/zap"
)

var (
	ErrPetNotFound  = errors.New("pet not found")
	ErrUnauthorized = errors.New("unauthorized")
)

type Service interface {
	CreatePet(ctx context.Context, profileID int64, params CreatePetParams) (PetResponse, error)
	GetPet(ctx context.Context, externalID string) (PetResponse, error)
	UpdatePet(ctx context.Context, externalID string, profileID int64, params UpdatePetParams) (PetResponse, error)
	UpdatePetAvailability(ctx context.Context, externalID string, profileID int64, params UpdatePetAvailabilityParams) (PetResponse, error)
	GetPetsByProfileID(ctx context.Context, profileID int64) ([]PetResponse, error)
	GetNearbyPets(ctx context.Context, params NearbyPetsParams) ([]NearbyPetResponse, error)
}

type svc struct {
	repo     repo.Querier
	snowNode *snowflake.Node
	validate *validator.Validate
}

// NewService creates a new pets service with the provided dependencies.
func NewService(repo repo.Querier, snowNode *snowflake.Node) Service {
	return &svc{
		repo:     repo,
		snowNode: snowNode,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// CreatePet creates a new pet record for the specified profile.
// Returns an error if validation fails or the pet cannot be created.
func (s *svc) CreatePet(ctx context.Context, profileID int64, params CreatePetParams) (PetResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return PetResponse{}, err
	}

	externalID := s.snowNode.Generate().String()

	// Set default photos if empty
	photos := params.Photos
	if photos == nil {
		photos = []string{}
	}

	// Convert optional fields to pgtype
	var breed pgtype.Text
	if params.Breed != nil {
		breed = pgtype.Text{String: *params.Breed, Valid: true}
	}

	var age pgtype.Int4
	if params.Age != nil {
		age = pgtype.Int4{Int32: int32(*params.Age), Valid: true}
	}

	var gender pgtype.Text
	if params.Gender != nil {
		gender = pgtype.Text{String: *params.Gender, Valid: true}
	}

	var size pgtype.Text
	if params.Size != nil {
		size = pgtype.Text{String: *params.Size, Valid: true}
	}

	description := pgtype.Text{String: params.Description, Valid: true}
	currentOwnerProfileID := pgtype.Int8{Int64: profileID, Valid: true}

	pet, err := s.repo.CreatePet(ctx, repo.CreatePetParams{
		ExternalID:             externalID,
		ProfileID:              profileID,
		Name:                   params.Name,
		Species:                params.Species,
		Breed:                  breed,
		Age:                    age,
		Gender:                 gender,
		Size:                   size,
		Description:            description,
		Photos:                 photos,
		IsAvailableForAdoption: params.IsAvailableForAdoption,
		CurrentOwnerProfileID:  currentOwnerProfileID,
	})
	if err != nil {
		logger.Error("failed to create pet", zap.Error(err), zap.Int64("profile_id", profileID))
		return PetResponse{}, fmt.Errorf("failed to create pet: %w", err)
	}

	return s.mapPetToResponse(pet), nil
}

// GetPet retrieves a pet by its external ID.
// Returns ErrPetNotFound if the pet does not exist.
func (s *svc) GetPet(ctx context.Context, externalID string) (PetResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	pet, err := s.repo.GetPet(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Info("pet not found", zap.String("pet_external_id", externalID))
			return PetResponse{}, ErrPetNotFound
		}
		logger.Error("failed to get pet", zap.Error(err), zap.String("pet_external_id", externalID))
		return PetResponse{}, fmt.Errorf("failed to get pet: %w", err)
	}

	return s.mapPetToResponse(pet), nil
}

// UpdatePet updates an existing pet's information.
// Only the pet owner can update their pet. Returns ErrUnauthorized if the
// requester is not the pet owner.
func (s *svc) UpdatePet(ctx context.Context, externalID string, profileID int64, params UpdatePetParams) (PetResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	// First verify the pet exists and belongs to the profile
	pet, err := s.repo.GetPet(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return PetResponse{}, ErrPetNotFound
		}
		return PetResponse{}, fmt.Errorf("failed to get pet: %w", err)
	}

	// Check ownership
	if pet.ProfileID != profileID {
		logger.Info("unauthorized pet update attempt", zap.String("pet_external_id", externalID), zap.Int64("profile_id", profileID))
		return PetResponse{}, ErrUnauthorized
	}

	// Build update params
	updateParams := repo.UpdatePetParams{
		ExternalID: externalID,
	}

	if params.Name != nil {
		updateParams.Name = *params.Name
	} else {
		updateParams.Name = pet.Name
	}

	if params.Species != nil {
		updateParams.Species = *params.Species
	} else {
		updateParams.Species = pet.Species
	}

	if params.Breed != nil {
		updateParams.Breed = pgtype.Text{String: *params.Breed, Valid: true}
	} else {
		updateParams.Breed = pet.Breed
	}

	if params.Age != nil {
		updateParams.Age = pgtype.Int4{Int32: int32(*params.Age), Valid: true}
	} else {
		updateParams.Age = pet.Age
	}

	if params.Gender != nil {
		updateParams.Gender = pgtype.Text{String: *params.Gender, Valid: true}
	} else {
		updateParams.Gender = pet.Gender
	}

	if params.Size != nil {
		updateParams.Size = pgtype.Text{String: *params.Size, Valid: true}
	} else {
		updateParams.Size = pet.Size
	}

	if params.Description != nil {
		updateParams.Description = pgtype.Text{String: *params.Description, Valid: true}
	} else {
		updateParams.Description = pet.Description
	}

	if params.Photos != nil {
		updateParams.Photos = params.Photos
	} else {
		updateParams.Photos = pet.Photos
	}

	updatedPet, err := s.repo.UpdatePet(ctx, updateParams)
	if err != nil {
		logger.Error("failed to update pet", zap.Error(err), zap.String("pet_external_id", externalID))
		return PetResponse{}, fmt.Errorf("failed to update pet: %w", err)
	}

	return s.mapPetToResponse(updatedPet), nil
}

// UpdatePetAvailability updates whether a pet is available for adoption.
// Only the pet owner can update availability. Returns ErrUnauthorized if the
// requester is not the pet owner.
func (s *svc) UpdatePetAvailability(ctx context.Context, externalID string, profileID int64, params UpdatePetAvailabilityParams) (PetResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return PetResponse{}, err
	}

	// First verify the pet exists and belongs to the profile
	pet, err := s.repo.GetPet(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return PetResponse{}, ErrPetNotFound
		}
		return PetResponse{}, fmt.Errorf("failed to get pet: %w", err)
	}

	// Check ownership
	if pet.ProfileID != profileID {
		logger.Info("unauthorized pet availability update attempt", zap.String("pet_external_id", externalID), zap.Int64("profile_id", profileID))
		return PetResponse{}, ErrUnauthorized
	}

	updatedPet, err := s.repo.UpdatePetAvailability(ctx, repo.UpdatePetAvailabilityParams{
		ExternalID:             externalID,
		IsAvailableForAdoption: params.IsAvailableForAdoption,
	})
	if err != nil {
		logger.Error("failed to update pet availability", zap.Error(err), zap.String("pet_external_id", externalID))
		return PetResponse{}, fmt.Errorf("failed to update pet availability: %w", err)
	}

	return s.mapPetToResponse(updatedPet), nil
}

func (s *svc) GetPetsByProfileID(ctx context.Context, profileID int64) ([]PetResponse, error) {
	pets, err := s.repo.GetPetsByProfileID(ctx, profileID)
	if err != nil {
		zap.L().Error("failed to get pets by profile id", zap.Error(err))
		return nil, fmt.Errorf("failed to get pets: %w", err)
	}

	result := make([]PetResponse, len(pets))
	for i, pet := range pets {
		result[i] = s.mapPetToResponse(pet)
	}

	return result, nil
}

// GetNearbyPets retrieves pets available for adoption within a specified radius
// from the given coordinates. Results are sorted by distance.
func (s *svc) GetNearbyPets(ctx context.Context, params NearbyPetsParams) ([]NearbyPetResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return nil, err
	}

	limit := params.Limit
	if limit <= 0 || limit > 100 {
		limit = 50 // default limit
	}

	pets, err := s.repo.GetAvailablePetsNearby(ctx, repo.GetAvailablePetsNearbyParams{
		Latitude:  params.Latitude,
		Longitude: params.Longitude,
		Limit:     int32(limit),
	})
	if err != nil {
		logger.Error("failed to get nearby pets", zap.Error(err), zap.Float64("latitude", params.Latitude), zap.Float64("longitude", params.Longitude))
		return nil, fmt.Errorf("failed to get nearby pets: %w", err)
	}

	result := make([]NearbyPetResponse, 0, len(pets))
	for _, petRow := range pets {
		// Use distance from query result
		distance := petRow.Distance

		// Apply radius filter if specified
		if params.Radius > 0 && distance > params.Radius {
			continue
		}

		// Map pet row to PetinPet for mapping
		pet := repo.PetinPet{
			ID:                     petRow.ID,
			ExternalID:             petRow.ExternalID,
			ProfileID:              petRow.ProfileID,
			Name:                   petRow.Name,
			Species:                petRow.Species,
			Breed:                  petRow.Breed,
			Age:                    petRow.Age,
			Gender:                 petRow.Gender,
			Size:                   petRow.Size,
			Description:            petRow.Description,
			Photos:                 petRow.Photos,
			IsAvailableForAdoption: petRow.IsAvailableForAdoption,
			CurrentOwnerProfileID:  petRow.CurrentOwnerProfileID,
			CreatedAt:              petRow.CreatedAt,
			UpdatedAt:              petRow.UpdatedAt,
		}

		petResp := s.mapPetToResponse(pet)

		var ownerAvatar *string
		if petRow.OwnerAvatar.Valid {
			ownerAvatar = &petRow.OwnerAvatar.String
		}

		result = append(result, NearbyPetResponse{
			PetResponse: petResp,
			OwnerName:   petRow.OwnerName,
			OwnerAvatar: ownerAvatar,
			Distance:    distance,
		})
	}

	return result, nil
}

func (s *svc) mapPetToResponse(pet repo.PetinPet) PetResponse {
	var updatedAt *time.Time
	if pet.UpdatedAt.Valid {
		updatedAt = &pet.UpdatedAt.Time
	}

	var breed *string
	if pet.Breed.Valid {
		breed = &pet.Breed.String
	}

	var age *int
	if pet.Age.Valid {
		ageVal := int(pet.Age.Int32)
		age = &ageVal
	}

	var gender *string
	if pet.Gender.Valid {
		gender = &pet.Gender.String
	}

	var size *string
	if pet.Size.Valid {
		size = &pet.Size.String
	}

	description := ""
	if pet.Description.Valid {
		description = pet.Description.String
	}

	var currentOwnerProfileID *int64
	if pet.CurrentOwnerProfileID.Valid {
		currentOwnerProfileID = &pet.CurrentOwnerProfileID.Int64
	}

	return PetResponse{
		ExternalID:             pet.ExternalID,
		ProfileID:              pet.ProfileID,
		Name:                   pet.Name,
		Species:                pet.Species,
		Breed:                  breed,
		Age:                    age,
		Gender:                 gender,
		Size:                   size,
		Description:            description,
		Photos:                 pet.Photos,
		IsAvailableForAdoption: pet.IsAvailableForAdoption,
		CurrentOwnerProfileID:  currentOwnerProfileID,
		CreatedAt:              pet.CreatedAt.Time,
		UpdatedAt:              updatedAt,
	}
}
