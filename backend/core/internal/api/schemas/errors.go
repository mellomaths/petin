package schemas

type ErrorResponse struct {
	ErrorCode    string            `json:"error_code"`
	ErrorMessage string            `json:"error_message"`
	Errors       map[string]string `json:"errors"`
}

type ErrorCode string

const (
	ErrorCodeInvalidBody         ErrorCode = "INVALID_BODY"
	ErrorCodeInternalServerError ErrorCode = "INTERNAL_SERVER_ERROR"
	ErrorCodeConflict            ErrorCode = "RESOURCE_CONFLICT"
	ErrorCodeNotFound            ErrorCode = "RESOURCE_NOT_FOUND"
	ErrorCodeUnauthorized        ErrorCode = "UNAUTHORIZED"
)
