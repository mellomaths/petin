package test

import (
	"context"

	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/stretchr/testify/mock"
)

// MockQuerier is a reusable mock implementation of repo.Querier
type MockQuerier struct {
	mock.Mock
}

func (m *MockQuerier) CreateAccount(ctx context.Context, arg repo.CreateAccountParams) (repo.PetinAccount, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinAccount{}, args.Error(1)
	}
	result := args.Get(0).(repo.PetinAccount)
	// If ExternalID is empty in the mock return, use the one from the input
	if result.ExternalID == "" {
		result.ExternalID = arg.ExternalID
	}
	return result, args.Error(1)
}

func (m *MockQuerier) GetAccount(ctx context.Context, externalID string) (repo.PetinAccount, error) {
	args := m.Called(ctx, externalID)
	if args.Get(0) == nil {
		return repo.PetinAccount{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinAccount), args.Error(1)
}

func (m *MockQuerier) GetAccountByEmail(ctx context.Context, email string) (repo.PetinAccount, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return repo.PetinAccount{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinAccount), args.Error(1)
}

func (m *MockQuerier) UpdateAccountStatus(ctx context.Context, arg repo.UpdateAccountStatusParams) (repo.PetinAccount, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinAccount{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinAccount), args.Error(1)
}

func (m *MockQuerier) CreateAddress(ctx context.Context, arg repo.CreateAddressParams) (repo.PetinAddress, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinAddress{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinAddress), args.Error(1)
}

func (m *MockQuerier) CreateProfile(ctx context.Context, arg repo.CreateProfileParams) (repo.PetinProfile, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinProfile{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinProfile), args.Error(1)
}

func (m *MockQuerier) GetProfileByAccountExternalID(ctx context.Context, externalID string) (repo.GetProfileByAccountExternalIDRow, error) {
	args := m.Called(ctx, externalID)
	if args.Get(0) == nil {
		return repo.GetProfileByAccountExternalIDRow{}, args.Error(1)
	}
	return args.Get(0).(repo.GetProfileByAccountExternalIDRow), args.Error(1)
}

func (m *MockQuerier) CreatePet(ctx context.Context, arg repo.CreatePetParams) (repo.PetinPet, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinPet{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinPet), args.Error(1)
}

func (m *MockQuerier) GetPet(ctx context.Context, externalID string) (repo.PetinPet, error) {
	args := m.Called(ctx, externalID)
	if args.Get(0) == nil {
		return repo.PetinPet{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinPet), args.Error(1)
}

func (m *MockQuerier) GetPetByID(ctx context.Context, id int64) (repo.PetinPet, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return repo.PetinPet{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinPet), args.Error(1)
}

func (m *MockQuerier) UpdatePet(ctx context.Context, arg repo.UpdatePetParams) (repo.PetinPet, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinPet{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinPet), args.Error(1)
}

func (m *MockQuerier) UpdatePetAvailability(ctx context.Context, arg repo.UpdatePetAvailabilityParams) (repo.PetinPet, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinPet{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinPet), args.Error(1)
}

func (m *MockQuerier) UpdatePetCurrentOwner(ctx context.Context, arg repo.UpdatePetCurrentOwnerParams) (repo.PetinPet, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinPet{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinPet), args.Error(1)
}

func (m *MockQuerier) GetPetsByProfileID(ctx context.Context, profileID int64) ([]repo.PetinPet, error) {
	args := m.Called(ctx, profileID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]repo.PetinPet), args.Error(1)
}

func (m *MockQuerier) GetAvailablePetsNearby(ctx context.Context, arg repo.GetAvailablePetsNearbyParams) ([]repo.GetAvailablePetsNearbyRow, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]repo.GetAvailablePetsNearbyRow), args.Error(1)
}

func (m *MockQuerier) CreateConversation(ctx context.Context, arg repo.CreateConversationParams) (repo.PetinConversation, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinConversation{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinConversation), args.Error(1)
}

func (m *MockQuerier) GetConversation(ctx context.Context, externalID string) (repo.PetinConversation, error) {
	args := m.Called(ctx, externalID)
	if args.Get(0) == nil {
		return repo.PetinConversation{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinConversation), args.Error(1)
}

func (m *MockQuerier) GetConversationByID(ctx context.Context, id int64) (repo.PetinConversation, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return repo.PetinConversation{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinConversation), args.Error(1)
}

func (m *MockQuerier) GetConversationsByProfileID(ctx context.Context, adopterProfileID int64) ([]repo.PetinConversation, error) {
	args := m.Called(ctx, adopterProfileID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]repo.PetinConversation), args.Error(1)
}

func (m *MockQuerier) CreateMessage(ctx context.Context, arg repo.CreateMessageParams) (repo.PetinMessage, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinMessage{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinMessage), args.Error(1)
}

func (m *MockQuerier) GetMessagesByConversationID(ctx context.Context, conversationID int64) ([]repo.PetinMessage, error) {
	args := m.Called(ctx, conversationID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]repo.PetinMessage), args.Error(1)
}

func (m *MockQuerier) CreateReport(ctx context.Context, arg repo.CreateReportParams) (repo.PetinReport, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinReport{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinReport), args.Error(1)
}

func (m *MockQuerier) GetReport(ctx context.Context, externalID string) (repo.PetinReport, error) {
	args := m.Called(ctx, externalID)
	if args.Get(0) == nil {
		return repo.PetinReport{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinReport), args.Error(1)
}

func (m *MockQuerier) CreateHandover(ctx context.Context, arg repo.CreateHandoverParams) (repo.PetinHandover, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinHandover{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinHandover), args.Error(1)
}

func (m *MockQuerier) GetHandover(ctx context.Context, externalID string) (repo.PetinHandover, error) {
	args := m.Called(ctx, externalID)
	if args.Get(0) == nil {
		return repo.PetinHandover{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinHandover), args.Error(1)
}

func (m *MockQuerier) GetHandoversByProfileID(ctx context.Context, ownerProfileID int64) ([]repo.PetinHandover, error) {
	args := m.Called(ctx, ownerProfileID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]repo.PetinHandover), args.Error(1)
}

func (m *MockQuerier) UpdateHandoverLocation(ctx context.Context, arg repo.UpdateHandoverLocationParams) (repo.PetinHandover, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinHandover{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinHandover), args.Error(1)
}

func (m *MockQuerier) UpdateHandoverScheduledDate(ctx context.Context, arg repo.UpdateHandoverScheduledDateParams) (repo.PetinHandover, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinHandover{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinHandover), args.Error(1)
}

func (m *MockQuerier) ConfirmHandover(ctx context.Context, arg repo.ConfirmHandoverParams) (repo.PetinHandover, error) {
	args := m.Called(ctx, arg)
	if args.Get(0) == nil {
		return repo.PetinHandover{}, args.Error(1)
	}
	return args.Get(0).(repo.PetinHandover), args.Error(1)
}

