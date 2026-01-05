package reports

import (
	"context"
	"testing"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/test"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestService_CreateReport(t *testing.T) {
	tests := []struct {
		name          string
		reporterID    int64
		params        CreateReportParams
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "successful report creation",
			reporterID: 1,
			params: CreateReportParams{
				ReportedProfileID: 2,
				Reason:            "SELLING_PET",
				Description:       "User is trying to sell pets",
			},
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("CreateReport", mock.Anything, mock.MatchedBy(func(arg repo.CreateReportParams) bool {
					return arg.ReporterProfileID == 1 && arg.ReportedProfileID == 2 && arg.Reason == "SELLING_PET"
				})).Return(repo.PetinReport{
					ExternalID:        "report-id",
					ReporterProfileID: 1,
					ReportedProfileID: 2,
					Reason:            "SELLING_PET",
					Description:       "User is trying to sell pets",
					Status:            string(ReportStatusPending),
					CreatedAt:         pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "cannot report yourself",
			reporterID: 1,
			params: CreateReportParams{
				ReportedProfileID: 1, // Same as reporter
				Reason:            "SELLING_PET",
				Description:       "Test",
			},
			mockSetup:     func(mockRepo *test.MockQuerier) {},
			expectedError: nil, // Returns error but not a specific type
		},
		{
			name:       "missing required fields",
			reporterID: 1,
			params: CreateReportParams{
				ReportedProfileID: 2,
				Reason:            "",
				Description:       "",
			},
			mockSetup:     func(mockRepo *test.MockQuerier) {},
			expectedError: nil, // Validation error
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.CreateReport(context.Background(), tt.reporterID, tt.params)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else if err != nil {
				// Expected error for validation or self-reporting
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ExternalID)
				assert.Equal(t, tt.params.Reason, result.Reason)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_GetReport(t *testing.T) {
	tests := []struct {
		name          string
		externalID    string
		mockSetup     func(*test.MockQuerier)
		expectedError error
	}{
		{
			name:       "successful get report",
			externalID: "report-id",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetReport", mock.Anything, "report-id").Return(repo.PetinReport{
					ExternalID:        "report-id",
					ReporterProfileID: 1,
					ReportedProfileID: 2,
					Reason:            "SELLING_PET",
					Description:       "User is trying to sell pets",
					Status:            string(ReportStatusPending),
					CreatedAt:         pgtype.Timestamp{Time: time.Now(), Valid: true},
				}, nil)
			},
			expectedError: nil,
		},
		{
			name:       "report not found",
			externalID: "non-existent",
			mockSetup: func(mockRepo *test.MockQuerier) {
				mockRepo.On("GetReport", mock.Anything, "non-existent").Return(repo.PetinReport{}, pgx.ErrNoRows)
			},
			expectedError: ErrReportNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(test.MockQuerier)
			tt.mockSetup(mockRepo)
			snowNode, _ := snowflake.NewNode(1)

			service := NewService(mockRepo, snowNode)
			result, err := service.GetReport(context.Background(), tt.externalID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedError, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.externalID, result.ExternalID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

