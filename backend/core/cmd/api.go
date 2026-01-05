package main

import (
	"net/http"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
	authmiddleware "github.com/mellomaths/petin/backend/core/internal/api/middleware"
	"github.com/mellomaths/petin/backend/core/internal/domain/accounts"
	"github.com/mellomaths/petin/backend/core/internal/domain/auth"
	"github.com/mellomaths/petin/backend/core/internal/domain/chat"
	"github.com/mellomaths/petin/backend/core/internal/domain/handovers"
	"github.com/mellomaths/petin/backend/core/internal/domain/pets"
	"github.com/mellomaths/petin/backend/core/internal/domain/profiles"
	"github.com/mellomaths/petin/backend/core/internal/domain/reports"
	"github.com/mellomaths/petin/backend/core/internal/infra/config"
	"go.uber.org/zap"
)

type RESTAPIServer struct {
	config   config.Config
	db       *pgx.Conn
	snowNode *snowflake.Node
}

func NewRESTAPIServer(cfg config.Config, db *pgx.Conn, snowNode *snowflake.Node) *RESTAPIServer {
	return &RESTAPIServer{
		config:   cfg,
		db:       db,
		snowNode: snowNode,
	}
}

func (a *RESTAPIServer) Mount() http.Handler {
	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.RequestID) // Request ID for tracing
	r.Use(middleware.RealIP)    // Real IP for rate limiting, analytics and tracing
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer) // Recover from crashes

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	// Global rate limiting: 100 requests per minute per IP
	r.Use(httprate.LimitByIP(100, 1*time.Minute))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		api.NewJsonResponse(w, http.StatusOK, schemas.HealthCheckResponse{
			Message: "OK",
		})
	})

	accountsSvc := accounts.NewService(repo.New(a.db), a.snowNode)
	accountsHandler := accounts.NewHandler(accountsSvc)
	profilesSvc := profiles.NewService(repo.New(a.db), a.db, a.snowNode)
	profilesHandler := profiles.NewHandler(profilesSvc)
	
	// Auth routes
	authSvc := auth.NewService(
		accountsSvc,
		repo.New(a.db),
		a.snowNode,
		a.config.JWT.Secret,
		time.Duration(a.config.JWT.Expiry)*time.Hour,
	)
	authHandler := auth.NewHandler(authSvc)
	authMiddleware := authmiddleware.AuthMiddleware(authSvc)
	
	// Auth routes with stricter rate limiting to prevent brute force attacks
	r.Route("/auth", func(r chi.Router) {
		// Stricter rate limiting for auth endpoints: 5 requests per minute per IP
		r.Use(httprate.LimitByIP(5, 1*time.Minute))
		r.Post("/login", authHandler.Login)
		r.Post("/refresh", authHandler.RefreshToken)
	})
	
	r.Route("/accounts", func(r chi.Router) {
		r.Post("/", accountsHandler.CreateAccount)
		r.Get("/{externalId}", accountsHandler.GetAccount)
		r.Patch("/{externalId}/status", accountsHandler.UpdateAccountStatus)
		r.Post("/{externalId}/verify", accountsHandler.VerifyEmail)
		r.With(authMiddleware).Post("/{externalId}/profiles", profilesHandler.CreateProfile)
		r.With(authMiddleware).Get("/{externalId}/profiles", profilesHandler.GetProfile)
	})
	
	// Pets routes
	petsSvc := pets.NewService(repo.New(a.db), a.snowNode)
	petsHandler := pets.NewHandler(petsSvc, repo.New(a.db))
	r.Route("/pets", func(r chi.Router) {
		r.With(authMiddleware).Post("/", petsHandler.CreatePet)
		r.Get("/{externalId}", petsHandler.GetPet)
		r.With(authMiddleware).Patch("/{externalId}", petsHandler.UpdatePet)
		r.With(authMiddleware).Patch("/{externalId}/availability", petsHandler.UpdatePetAvailability)
		r.Get("/nearby", petsHandler.GetNearbyPets)
	})
	
	r.Route("/profiles", func(r chi.Router) {
		r.Get("/{externalId}/pets", petsHandler.GetPetsByProfile)
	})
	
	// Chat routes and handover routes (nested under conversations)
	chatSvc := chat.NewService(repo.New(a.db), a.snowNode)
	chatHandler := chat.NewHandler(chatSvc, repo.New(a.db))
	handoversSvc := handovers.NewService(repo.New(a.db), a.snowNode)
	handoversHandler := handovers.NewHandler(handoversSvc, repo.New(a.db))
	r.Route("/conversations", func(r chi.Router) {
		r.With(authMiddleware).Post("/", chatHandler.CreateConversation)
		r.With(authMiddleware).Get("/", chatHandler.GetConversations)
		r.Get("/{externalId}", chatHandler.GetConversation)
		r.With(authMiddleware).Post("/{externalId}/messages", chatHandler.CreateMessage)
		r.Get("/{externalId}/messages", chatHandler.GetMessages)
		r.With(authMiddleware).Post("/{conversationId}/handovers", handoversHandler.CreateHandover)
	})
	
	// Reports routes
	reportsSvc := reports.NewService(repo.New(a.db), a.snowNode)
	reportsHandler := reports.NewHandler(reportsSvc, repo.New(a.db))
	r.Route("/reports", func(r chi.Router) {
		r.With(authMiddleware).Post("/", reportsHandler.CreateReport)
		r.Get("/{externalId}", reportsHandler.GetReport)
	})
	
	// Handover routes
	r.Route("/handovers", func(r chi.Router) {
		r.Get("/{externalId}", handoversHandler.GetHandover)
		r.With(authMiddleware).Patch("/{externalId}/location", handoversHandler.UpdateHandoverLocation)
		r.With(authMiddleware).Patch("/{externalId}/scheduled-date", handoversHandler.UpdateHandoverScheduledDate)
		r.With(authMiddleware).Patch("/{externalId}/confirm", handoversHandler.ConfirmHandover)
		r.With(authMiddleware).Patch("/{externalId}/cancel", handoversHandler.CancelHandover)
		r.With(authMiddleware).Get("/", handoversHandler.GetHandovers)
	})
	
	return r
}

func (api *RESTAPIServer) Run(h http.Handler) error {
	srv := &http.Server{
		Addr:         api.config.Port,
		Handler:      h,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}
	zap.L().Info("server has started", zap.String("addr", api.config.Port))
	return srv.ListenAndServe()
}
