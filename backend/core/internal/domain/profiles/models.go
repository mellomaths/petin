package profiles

import (
	"time"

	"github.com/mellomaths/petin/backend/core/internal/domain/accounts"
)

type ProfileResponse struct {
	ExternalID     string                   `json:"external_id"`
	Account        accounts.AccountResponse `json:"account"`
	Fullname       string                   `json:"fullname"`
	DocumentNumber string                   `json:"document_number"`
	DocumentType   string                   `json:"document_type"`
	Birthdate      time.Time                `json:"birthdate"`
	Bio            string                   `json:"bio"`
	Gender         string                   `json:"gender"`
	PhoneNumber    string                   `json:"phone_number"`
	Avatar         string                   `json:"avatar"`
	Address        CreateAddressParams      `json:"address"`
}

type CreateProfileParams struct {
	Fullname       string              `json:"fullname" validate:"required"`
	DocumentNumber string              `json:"document_number" validate:"required"`
	DocumentType   string              `json:"document_type" validate:"required"`
	Birthdate      time.Time           `json:"birthdate" validate:"required"`
	Bio            string              `json:"bio" validate:"required"`
	Gender         string              `json:"gender"`
	PhoneNumber    string              `json:"phone_number" validate:"required"`
	Avatar         string              `json:"avatar" validate:"required"`
	Address        CreateAddressParams `json:"address" validate:"required"`
}

type CreateAddressParams struct {
	AddressLine  string  `json:"address_line" validate:"required"`
	StreetNumber string  `json:"street_number" validate:"required"`
	City         string  `json:"city" validate:"required"`
	State        string  `json:"state" validate:"required"`
	CountryCode  string  `json:"country_code" validate:"required"`
	ZipCode      string  `json:"zip_code" validate:"required"`
	Latitude     float64 `json:"latitude" validate:"required"`
	Longitude    float64 `json:"longitude" validate:"required"`
}
