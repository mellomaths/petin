package reports

import "time"

type ReportResponse struct {
	ExternalID        string    `json:"external_id"`
	ReporterProfileID int64     `json:"reporter_profile_id"`
	ReportedProfileID int64     `json:"reported_profile_id"`
	Reason            string    `json:"reason"`
	Description       string    `json:"description"`
	Status            string    `json:"status"`
	CreatedAt         time.Time `json:"created_at"`
}

type CreateReportParams struct {
	ReportedProfileID int64  `json:"reported_profile_id" validate:"required"`
	Reason            string `json:"reason" validate:"required"`
	Description       string `json:"description" validate:"required"`
}

type ReportStatus string

const (
	ReportStatusPending  ReportStatus = "PENDING"
	ReportStatusReviewed ReportStatus = "REVIEWED"
	ReportStatusResolved ReportStatus = "RESOLVED"
)

