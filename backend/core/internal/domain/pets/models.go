package pets

import "time"

type PetResponse struct {
	ExternalID            string    `json:"external_id"`
	ProfileID             int64     `json:"profile_id"`
	Name                  string    `json:"name"`
	Species               string    `json:"species"`
	Breed                 *string   `json:"breed,omitempty"`
	Age                   *int      `json:"age,omitempty"`
	Gender                *string   `json:"gender,omitempty"`
	Size                  *string   `json:"size,omitempty"`
	Description           string    `json:"description"`
	Photos                []string  `json:"photos"`
	IsAvailableForAdoption bool     `json:"is_available_for_adoption"`
	CurrentOwnerProfileID *int64    `json:"current_owner_profile_id,omitempty"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             *time.Time `json:"updated_at,omitempty"`
}

type CreatePetParams struct {
	Name                  string   `json:"name" validate:"required"`
	Species               string   `json:"species" validate:"required"`
	Breed                 *string  `json:"breed,omitempty"`
	Age                   *int     `json:"age,omitempty"`
	Gender                *string  `json:"gender,omitempty"`
	Size                  *string  `json:"size,omitempty"`
	Description           string   `json:"description" validate:"required"`
	Photos                []string `json:"photos"`
	IsAvailableForAdoption bool    `json:"is_available_for_adoption"`
}

type UpdatePetParams struct {
	Name        *string  `json:"name,omitempty"`
	Species     *string  `json:"species,omitempty"`
	Breed       *string  `json:"breed,omitempty"`
	Age         *int     `json:"age,omitempty"`
	Gender      *string  `json:"gender,omitempty"`
	Size        *string  `json:"size,omitempty"`
	Description *string  `json:"description,omitempty"`
	Photos      []string `json:"photos,omitempty"`
}

type UpdatePetAvailabilityParams struct {
	IsAvailableForAdoption bool `json:"is_available_for_adoption"` // bool is always set (true or false), so required tag doesn't apply
}

type NearbyPetResponse struct {
	PetResponse
	OwnerName      string   `json:"owner_name"`
	OwnerAvatar    *string  `json:"owner_avatar,omitempty"`
	Distance       float64  `json:"distance"`
}

type NearbyPetsParams struct {
	Latitude  float64 `json:"latitude" validate:"required"`
	Longitude float64 `json:"longitude" validate:"required"`
	Radius    float64 `json:"radius,omitempty"`
	Limit     int     `json:"limit,omitempty"`
}

