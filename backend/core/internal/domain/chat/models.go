package chat

import "time"

type ConversationResponse struct {
	ExternalID        string    `json:"external_id"`
	PetID            int64     `json:"pet_id"`
	AdopterProfileID int64     `json:"adopter_profile_id"`
	OwnerProfileID   int64     `json:"owner_profile_id"`
	CreatedAt        time.Time `json:"created_at"`
}

type CreateConversationParams struct {
	PetExternalID      string `json:"pet_external_id" validate:"required"`
	AdopterProfileID   int64  `json:"adopter_profile_id" validate:"required"`
}

type MessageResponse struct {
	ExternalID        string    `json:"external_id"`
	ConversationID   int64     `json:"conversation_id"`
	SenderProfileID  int64     `json:"sender_profile_id"`
	Content          string    `json:"content"`
	CreatedAt        time.Time `json:"created_at"`
}

type CreateMessageParams struct {
	Content string `json:"content" validate:"required"`
}

