package api

import (
	"encoding/json"
	"net/http"
)

func DecodeJsonBody(r *http.Request, data any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(data)
}
