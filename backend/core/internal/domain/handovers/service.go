// Package handovers provides pet handover management functionality.
// It handles handover creation, location updates, scheduling, confirmation,
// and cancellation for the pet adoption process.
package handovers

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
	ErrHandoverNotFound = errors.New("handover not found")
	ErrUnauthorized     = errors.New("unauthorized")
	ErrInvalidStatus    = errors.New("invalid status")
)

type Service interface {
	CreateHandover(ctx context.Context, ownerProfileID int64, params CreateHandoverParams) (HandoverResponse, error)
	GetHandover(ctx context.Context, externalID string) (HandoverResponse, error)
	UpdateHandoverLocation(ctx context.Context, externalID string, profileID int64, params UpdateHandoverLocationParams) (HandoverResponse, error)
	UpdateHandoverScheduledDate(ctx context.Context, externalID string, ownerProfileID int64, params UpdateHandoverScheduledDateParams) (HandoverResponse, error)
	ConfirmHandover(ctx context.Context, externalID string, profileID int64) (HandoverResponse, error)
	CancelHandover(ctx context.Context, externalID string, ownerProfileID int64) (HandoverResponse, error)
	GetHandoversByProfileID(ctx context.Context, profileID int64) ([]HandoverResponse, error)
}

type svc struct {
	repo     repo.Querier
	snowNode *snowflake.Node
	validate *validator.Validate
}

// NewService creates a new handovers service with the provided dependencies.
func NewService(repo repo.Querier, snowNode *snowflake.Node) Service {
	return &svc{
		repo:     repo,
		snowNode: snowNode,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// CreateHandover creates a new handover for a pet adoption.
// Only the pet owner can create a handover. Returns ErrUnauthorized if the
// requester is not the conversation owner.
func (s *svc) CreateHandover(ctx context.Context, ownerProfileID int64, params CreateHandoverParams) (HandoverResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return HandoverResponse{}, err
	}

	// Get conversation
	conversation, err := s.repo.GetConversation(ctx, params.ConversationExternalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return HandoverResponse{}, fmt.Errorf("conversation not found: %w", err)
		}
		return HandoverResponse{}, fmt.Errorf("failed to get conversation: %w", err)
	}

	// Verify owner is the conversation owner
	if conversation.OwnerProfileID != ownerProfileID {
		return HandoverResponse{}, ErrUnauthorized
	}

	// Get pet by ID
	pet, err := s.repo.GetPetByID(ctx, conversation.PetID)
	if err != nil {
		return HandoverResponse{}, fmt.Errorf("failed to get pet: %w", err)
	}

	externalID := s.snowNode.Generate().String()
	status := string(HandoverStatusPending)
	if params.ScheduledDate != nil {
		status = string(HandoverStatusScheduled)
	}

	// Convert optional fields to pgtype
	var scheduledDate pgtype.Timestamp
	if params.ScheduledDate != nil {
		scheduledDate = pgtype.Timestamp{Time: *params.ScheduledDate, Valid: true}
	}

	var locationName pgtype.Text
	if params.LocationName != nil {
		locationName = pgtype.Text{String: *params.LocationName, Valid: true}
	}

	var locationAddress pgtype.Text
	if params.LocationAddress != nil {
		locationAddress = pgtype.Text{String: *params.LocationAddress, Valid: true}
	}

	var latitude pgtype.Float8
	if params.Latitude != nil {
		latitude = pgtype.Float8{Float64: *params.Latitude, Valid: true}
	}

	var longitude pgtype.Float8
	if params.Longitude != nil {
		longitude = pgtype.Float8{Float64: *params.Longitude, Valid: true}
	}

	var locationAddressID pgtype.Int8
	if params.LocationAddressID != nil {
		locationAddressID = pgtype.Int8{Int64: *params.LocationAddressID, Valid: true}
	}

	handover, err := s.repo.CreateHandover(ctx, repo.CreateHandoverParams{
		ExternalID:        externalID,
		ConversationID:    conversation.ID,
		PetID:             pet.ID,
		OwnerProfileID:   ownerProfileID,
		AdopterProfileID: conversation.AdopterProfileID,
		ScheduledDate:     scheduledDate,
		LocationName:      locationName,
		LocationAddress:   locationAddress,
		Latitude:          latitude,
		Longitude:         longitude,
		LocationAddressID: locationAddressID,
		Status:            status,
	})
	if err != nil {
		logger.Error("failed to create handover", zap.Error(err))
		return HandoverResponse{}, fmt.Errorf("failed to create handover: %w", err)
	}

	return s.mapHandoverToResponse(handover), nil
}

// GetHandover retrieves a handover by its external ID.
// Returns ErrHandoverNotFound if the handover does not exist.
func (s *svc) GetHandover(ctx context.Context, externalID string) (HandoverResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	handover, err := s.repo.GetHandover(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return HandoverResponse{}, ErrHandoverNotFound
		}
		logger.Error("failed to get handover", zap.Error(err), zap.String("handover_external_id", externalID))
		return HandoverResponse{}, fmt.Errorf("failed to get handover: %w", err)
	}

	return s.mapHandoverToResponse(handover), nil
}

// UpdateHandoverLocation updates the location of a handover.
// Owners can update the location directly, while adopters can request a location change.
// Returns ErrUnauthorized if the requester is not part of the handover.
func (s *svc) UpdateHandoverLocation(ctx context.Context, externalID string, profileID int64, params UpdateHandoverLocationParams) (HandoverResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	handover, err := s.repo.GetHandover(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return HandoverResponse{}, ErrHandoverNotFound
		}
		return HandoverResponse{}, fmt.Errorf("failed to get handover: %w", err)
	}

	// Check authorization
	isOwner := handover.OwnerProfileID == profileID
	isAdopter := handover.AdopterProfileID == profileID

	if !isOwner && !isAdopter {
		return HandoverResponse{}, ErrUnauthorized
	}

	// If adopter is requesting change
	if params.RequestChange && isAdopter {
		updateParams := repo.UpdateHandoverLocationParams{
			ExternalID: externalID,
		}

		// Keep existing location if not provided
		if params.LocationName != nil {
			updateParams.LocationName = pgtype.Text{String: *params.LocationName, Valid: true}
		} else {
			updateParams.LocationName = handover.LocationName
		}

		if params.LocationAddress != nil {
			updateParams.LocationAddress = pgtype.Text{String: *params.LocationAddress, Valid: true}
		} else {
			updateParams.LocationAddress = handover.LocationAddress
		}

		if params.Latitude != nil {
			updateParams.Latitude = pgtype.Float8{Float64: *params.Latitude, Valid: true}
		} else {
			updateParams.Latitude = handover.Latitude
		}

		if params.Longitude != nil {
			updateParams.Longitude = pgtype.Float8{Float64: *params.Longitude, Valid: true}
		} else {
			updateParams.Longitude = handover.Longitude
		}

		if params.LocationAddressID != nil {
			updateParams.LocationAddressID = pgtype.Int8{Int64: *params.LocationAddressID, Valid: true}
		} else {
			updateParams.LocationAddressID = handover.LocationAddressID
		}

		updateParams.LocationChangeRequested = true
		updateParams.LocationChangeRequestedBy = pgtype.Int8{Int64: profileID, Valid: true}
		if params.LocationChangeProposal != nil {
			updateParams.LocationChangeProposal = pgtype.Text{String: *params.LocationChangeProposal, Valid: true}
		}

		updated, err := s.repo.UpdateHandoverLocation(ctx, updateParams)
		if err != nil {
			logger.Error("failed to update handover location", zap.Error(err))
			return HandoverResponse{}, fmt.Errorf("failed to update handover location: %w", err)
		}

		return s.mapHandoverToResponse(updated), nil
	}

	// Owner updating location (clears change request)
	if isOwner {
		updateParams := repo.UpdateHandoverLocationParams{
			ExternalID: externalID,
		}

		if params.LocationName != nil {
			updateParams.LocationName = pgtype.Text{String: *params.LocationName, Valid: true}
		} else {
			updateParams.LocationName = handover.LocationName
		}

		if params.LocationAddress != nil {
			updateParams.LocationAddress = pgtype.Text{String: *params.LocationAddress, Valid: true}
		} else {
			updateParams.LocationAddress = handover.LocationAddress
		}

		if params.Latitude != nil {
			updateParams.Latitude = pgtype.Float8{Float64: *params.Latitude, Valid: true}
		} else {
			updateParams.Latitude = handover.Latitude
		}

		if params.Longitude != nil {
			updateParams.Longitude = pgtype.Float8{Float64: *params.Longitude, Valid: true}
		} else {
			updateParams.Longitude = handover.Longitude
		}

		if params.LocationAddressID != nil {
			updateParams.LocationAddressID = pgtype.Int8{Int64: *params.LocationAddressID, Valid: true}
		} else {
			updateParams.LocationAddressID = handover.LocationAddressID
		}

		updateParams.LocationChangeRequested = false
		updateParams.LocationChangeRequestedBy = pgtype.Int8{Valid: false}
		updateParams.LocationChangeProposal = pgtype.Text{Valid: false}

		updated, err := s.repo.UpdateHandoverLocation(ctx, updateParams)
		if err != nil {
			logger.Error("failed to update handover location", zap.Error(err))
			return HandoverResponse{}, fmt.Errorf("failed to update handover location: %w", err)
		}

		return s.mapHandoverToResponse(updated), nil
	}

	return HandoverResponse{}, ErrUnauthorized
}

// UpdateHandoverScheduledDate updates the scheduled date for a handover.
// Only the owner can update the scheduled date. Returns ErrUnauthorized if the
// requester is not the handover owner.
func (s *svc) UpdateHandoverScheduledDate(ctx context.Context, externalID string, ownerProfileID int64, params UpdateHandoverScheduledDateParams) (HandoverResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	handover, err := s.repo.GetHandover(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return HandoverResponse{}, ErrHandoverNotFound
		}
		return HandoverResponse{}, fmt.Errorf("failed to get handover: %w", err)
	}

	// Only owner can update scheduled date
	if handover.OwnerProfileID != ownerProfileID {
		return HandoverResponse{}, ErrUnauthorized
	}

	status := string(HandoverStatusPending)
	if params.ScheduledDate != nil {
		status = string(HandoverStatusScheduled)
	}

	var scheduledDate pgtype.Timestamp
	if params.ScheduledDate != nil {
		scheduledDate = pgtype.Timestamp{Time: *params.ScheduledDate, Valid: true}
	} else {
		scheduledDate = handover.ScheduledDate
	}

	updated, err := s.repo.UpdateHandoverScheduledDate(ctx, repo.UpdateHandoverScheduledDateParams{
		ExternalID:    externalID,
		ScheduledDate: scheduledDate,
		Status:        status,
	})
	if err != nil {
		logger.Error("failed to update handover scheduled date", zap.Error(err), zap.String("handover_external_id", externalID))
		return HandoverResponse{}, fmt.Errorf("failed to update handover scheduled date: %w", err)
	}

	return s.mapHandoverToResponse(updated), nil
}

// ConfirmHandover confirms a handover by either the owner or adopter.
// When both parties confirm, the handover is marked as completed and pet ownership is transferred.
// Returns ErrUnauthorized if the requester is not part of the handover.
func (s *svc) ConfirmHandover(ctx context.Context, externalID string, profileID int64) (HandoverResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	handover, err := s.repo.GetHandover(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return HandoverResponse{}, ErrHandoverNotFound
		}
		return HandoverResponse{}, fmt.Errorf("failed to get handover: %w", err)
	}

	// Check authorization
	isOwner := handover.OwnerProfileID == profileID
	isAdopter := handover.AdopterProfileID == profileID

	if !isOwner && !isAdopter {
		return HandoverResponse{}, ErrUnauthorized
	}

	ownerConfirmed := handover.OwnerConfirmed
	adopterConfirmed := handover.AdopterConfirmed

	if isOwner {
		ownerConfirmed = true
	}
	if isAdopter {
		adopterConfirmed = true
	}

	status := handover.Status
	var completedAt *time.Time

	// If both confirmed, mark as completed and transfer pet ownership
	if ownerConfirmed && adopterConfirmed {
		status = string(HandoverStatusCompleted)
		now := time.Now()
		completedAt = &now

		// Get pet to update ownership
		pet, err := s.repo.GetPetByID(ctx, handover.PetID)
		if err == nil {
			// Update pet availability and current owner
			_, err = s.repo.UpdatePetAvailability(ctx, repo.UpdatePetAvailabilityParams{
				ExternalID:            pet.ExternalID,
				IsAvailableForAdoption: false,
			})
			if err != nil {
				logger.Error("failed to update pet availability", zap.Error(err), zap.Int64("pet_id", pet.ID))
			}

			// Update current owner to adopter
			_, err = s.repo.UpdatePetCurrentOwner(ctx, repo.UpdatePetCurrentOwnerParams{
				ExternalID:            pet.ExternalID,
				CurrentOwnerProfileID: pgtype.Int8{Int64: handover.AdopterProfileID, Valid: true},
			})
			if err != nil {
				logger.Error("failed to update pet current owner", zap.Error(err), zap.Int64("pet_id", pet.ID))
			}
		}
	}

	var completedAtPgtype pgtype.Timestamp
	if completedAt != nil {
		completedAtPgtype = pgtype.Timestamp{Time: *completedAt, Valid: true}
	}

	updated, err := s.repo.ConfirmHandover(ctx, repo.ConfirmHandoverParams{
		ExternalID:       externalID,
		OwnerConfirmed:   ownerConfirmed,
		AdopterConfirmed: adopterConfirmed,
		Status:           status,
		CompletedAt:      completedAtPgtype,
	})
	if err != nil {
		logger.Error("failed to confirm handover", zap.Error(err))
		return HandoverResponse{}, fmt.Errorf("failed to confirm handover: %w", err)
	}

	return s.mapHandoverToResponse(updated), nil
}

// CancelHandover cancels a handover. Only the owner can cancel a handover.
// Returns ErrUnauthorized if the requester is not the handover owner.
func (s *svc) CancelHandover(ctx context.Context, externalID string, ownerProfileID int64) (HandoverResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	handover, err := s.repo.GetHandover(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return HandoverResponse{}, ErrHandoverNotFound
		}
		return HandoverResponse{}, fmt.Errorf("failed to get handover: %w", err)
	}

	// Only owner can cancel
	if handover.OwnerProfileID != ownerProfileID {
		return HandoverResponse{}, ErrUnauthorized
	}

	// Update status to cancelled
	updated, err := s.repo.UpdateHandoverScheduledDate(ctx, repo.UpdateHandoverScheduledDateParams{
		ExternalID:    externalID,
		ScheduledDate: handover.ScheduledDate,
		Status:        string(HandoverStatusCancelled),
	})
	if err != nil {
		logger.Error("failed to cancel handover", zap.Error(err))
		return HandoverResponse{}, fmt.Errorf("failed to cancel handover: %w", err)
	}

	return s.mapHandoverToResponse(updated), nil
}

// GetHandoversByProfileID retrieves all handovers for a given profile.
func (s *svc) GetHandoversByProfileID(ctx context.Context, profileID int64) ([]HandoverResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	handovers, err := s.repo.GetHandoversByProfileID(ctx, profileID)
	if err != nil {
		logger.Error("failed to get handovers", zap.Error(err), zap.Int64("profile_id", profileID))
		return nil, fmt.Errorf("failed to get handovers: %w", err)
	}

	result := make([]HandoverResponse, len(handovers))
	for i, h := range handovers {
		result[i] = s.mapHandoverToResponse(h)
	}

	return result, nil
}

func (s *svc) mapHandoverToResponse(h repo.PetinHandover) HandoverResponse {
	var scheduledDate *time.Time
	if h.ScheduledDate.Valid {
		scheduledDate = &h.ScheduledDate.Time
	}

	var locationName *string
	if h.LocationName.Valid {
		locationName = &h.LocationName.String
	}

	var locationAddress *string
	if h.LocationAddress.Valid {
		locationAddress = &h.LocationAddress.String
	}

	var latitude *float64
	if h.Latitude.Valid {
		latitude = &h.Latitude.Float64
	}

	var longitude *float64
	if h.Longitude.Valid {
		longitude = &h.Longitude.Float64
	}

	var locationAddressID *int64
	if h.LocationAddressID.Valid {
		locationAddressID = &h.LocationAddressID.Int64
	}

	var locationChangeRequestedBy *int64
	if h.LocationChangeRequestedBy.Valid {
		locationChangeRequestedBy = &h.LocationChangeRequestedBy.Int64
	}

	var locationChangeProposal *string
	if h.LocationChangeProposal.Valid {
		locationChangeProposal = &h.LocationChangeProposal.String
	}

	var completedAt *time.Time
	if h.CompletedAt.Valid {
		completedAt = &h.CompletedAt.Time
	}

	var updatedAt *time.Time
	if h.UpdatedAt.Valid {
		updatedAt = &h.UpdatedAt.Time
	}

	return HandoverResponse{
		ExternalID:              h.ExternalID,
		ConversationID:          h.ConversationID,
		PetID:                   h.PetID,
		OwnerProfileID:          h.OwnerProfileID,
		AdopterProfileID:        h.AdopterProfileID,
		ScheduledDate:           scheduledDate,
		LocationName:           locationName,
		LocationAddress:         locationAddress,
		Latitude:               latitude,
		Longitude:              longitude,
		LocationAddressID:      locationAddressID,
		LocationChangeRequested: h.LocationChangeRequested,
		LocationChangeRequestedBy: locationChangeRequestedBy,
		LocationChangeProposal: locationChangeProposal,
		OwnerConfirmed:         h.OwnerConfirmed,
		AdopterConfirmed:       h.AdopterConfirmed,
		Status:                 h.Status,
		CompletedAt:            completedAt,
		CreatedAt:              h.CreatedAt.Time,
		UpdatedAt:              updatedAt,
	}
}

