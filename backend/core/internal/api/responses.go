package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
)

func NewJsonResponse(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func NewJsonErrorResponse(w http.ResponseWriter, status int, errCode string, errMsg string, errors map[string]string) {
	NewJsonResponse(w, status, schemas.ErrorResponse{
		ErrorCode:    errCode,
		ErrorMessage: errMsg,
		Errors:       errors,
	})
}

func FormatValidationErrors(errs validator.ValidationErrors) map[string]string {
	errors := make(map[string]string)
	for _, e := range errs {
		field := strings.ToLower(e.Field())
		switch e.Tag() {
		case "required":
			errors[field] = "is required"
		case "email":
			errors[field] = "must be a valid email address"
		case "min":
			errors[field] = fmt.Sprintf("must be at least %s characters long", e.Param())
		case "max":
			errors[field] = fmt.Sprintf("must be at most %s characters long", e.Param())
		default:
			errors[field] = "is invalid"
		}
	}
	return errors
}
