package handovers

import "time"

type HandoverResponse struct {
	ExternalID              string     `json:"external_id"`
	ConversationID          int64      `json:"conversation_id"`
	PetID                   int64      `json:"pet_id"`
	OwnerProfileID          int64      `json:"owner_profile_id"`
	AdopterProfileID        int64      `json:"adopter_profile_id"`
	ScheduledDate           *time.Time `json:"scheduled_date,omitempty"`
	LocationName           *string     `json:"location_name,omitempty"`
	LocationAddress         *string     `json:"location_address,omitempty"`
	Latitude               *float64    `json:"latitude,omitempty"`
	Longitude              *float64    `json:"longitude,omitempty"`
	LocationAddressID      *int64      `json:"location_address_id,omitempty"`
	LocationChangeRequested bool       `json:"location_change_requested"`
	LocationChangeRequestedBy *int64   `json:"location_change_requested_by,omitempty"`
	LocationChangeProposal *string     `json:"location_change_proposal,omitempty"`
	OwnerConfirmed         bool        `json:"owner_confirmed"`
	AdopterConfirmed       bool        `json:"adopter_confirmed"`
	Status                 string      `json:"status"`
	CompletedAt            *time.Time  `json:"completed_at,omitempty"`
	CreatedAt              time.Time   `json:"created_at"`
	UpdatedAt              *time.Time  `json:"updated_at,omitempty"`
}

type CreateHandoverParams struct {
	ConversationExternalID string     `json:"conversation_external_id" validate:"required"`
	ScheduledDate          *time.Time `json:"scheduled_date,omitempty"`
	LocationName           *string    `json:"location_name,omitempty"`
	LocationAddress        *string    `json:"location_address,omitempty"`
	Latitude               *float64   `json:"latitude,omitempty"`
	Longitude              *float64   `json:"longitude,omitempty"`
	LocationAddressID      *int64     `json:"location_address_id,omitempty"`
}

type UpdateHandoverLocationParams struct {
	LocationName           *string `json:"location_name,omitempty"`
	LocationAddress        *string `json:"location_address,omitempty"`
	Latitude               *float64 `json:"latitude,omitempty"`
	Longitude              *float64 `json:"longitude,omitempty"`
	LocationAddressID      *int64  `json:"location_address_id,omitempty"`
	RequestChange          bool    `json:"request_change,omitempty"` // If true, adopter is requesting change
	LocationChangeProposal *string `json:"location_change_proposal,omitempty"`
}

type UpdateHandoverScheduledDateParams struct {
	ScheduledDate *time.Time `json:"scheduled_date,omitempty"`
}

type HandoverStatus string

const (
	HandoverStatusPending   HandoverStatus = "PENDING"
	HandoverStatusScheduled   HandoverStatus = "SCHEDULED"
	HandoverStatusCompleted   HandoverStatus = "COMPLETED"
	HandoverStatusCancelled   HandoverStatus = "CANCELLED"
)

