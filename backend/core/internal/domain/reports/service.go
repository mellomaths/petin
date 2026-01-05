// Package reports provides reporting functionality for users.
// It handles report creation for users attempting to sell pets,
// which violates the adoption-only policy.
package reports

import (
	"context"
	"errors"
	"fmt"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"go.uber.org/zap"
)

var (
	ErrReportNotFound    = errors.New("report not found")
	ErrCannotReportSelf  = errors.New("cannot report yourself")
)

type Service interface {
	CreateReport(ctx context.Context, reporterProfileID int64, params CreateReportParams) (ReportResponse, error)
	GetReport(ctx context.Context, externalID string) (ReportResponse, error)
}

type svc struct {
	repo     repo.Querier
	snowNode *snowflake.Node
	validate *validator.Validate
}

// NewService creates a new reports service with the provided dependencies.
func NewService(repo repo.Querier, snowNode *snowflake.Node) Service {
	return &svc{
		repo:     repo,
		snowNode: snowNode,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

// CreateReport creates a new report against a user profile.
// Returns ErrCannotReportSelf if the reporter tries to report themselves.
func (s *svc) CreateReport(ctx context.Context, reporterProfileID int64, params CreateReportParams) (ReportResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	if err := s.validate.Struct(params); err != nil {
		logger.Debug("invalid request body", zap.Error(err))
		return ReportResponse{}, err
	}

	// Prevent self-reporting
	if reporterProfileID == params.ReportedProfileID {
		return ReportResponse{}, ErrCannotReportSelf
	}

	externalID := s.snowNode.Generate().String()
	report, err := s.repo.CreateReport(ctx, repo.CreateReportParams{
		ExternalID:        externalID,
		ReporterProfileID: reporterProfileID,
		ReportedProfileID: params.ReportedProfileID,
		Reason:            params.Reason,
		Description:       params.Description,
		Status:            string(ReportStatusPending),
	})
	if err != nil {
		logger.Error("failed to create report", zap.Error(err), zap.Int64("reporter_profile_id", reporterProfileID))
		return ReportResponse{}, fmt.Errorf("failed to create report: %w", err)
	}

	return ReportResponse{
		ExternalID:        report.ExternalID,
		ReporterProfileID: report.ReporterProfileID,
		ReportedProfileID: report.ReportedProfileID,
		Reason:            report.Reason,
		Description:       report.Description,
		Status:            report.Status,
		CreatedAt:         report.CreatedAt.Time,
	}, nil
}

// GetReport retrieves a report by its external ID.
// Returns ErrReportNotFound if the report does not exist.
func (s *svc) GetReport(ctx context.Context, externalID string) (ReportResponse, error) {
	logger := api.LogWithRequestIDFromContext(ctx)
	report, err := s.repo.GetReport(ctx, externalID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return ReportResponse{}, ErrReportNotFound
		}
		logger.Error("failed to get report", zap.Error(err), zap.String("report_external_id", externalID))
		return ReportResponse{}, fmt.Errorf("failed to get report: %w", err)
	}

	return ReportResponse{
		ExternalID:        report.ExternalID,
		ReporterProfileID: report.ReporterProfileID,
		ReportedProfileID: report.ReportedProfileID,
		Reason:            report.Reason,
		Description:       report.Description,
		Status:            report.Status,
		CreatedAt:         report.CreatedAt.Time,
	}, nil
}

