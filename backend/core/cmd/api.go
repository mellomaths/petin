package main

import (
	"net/http"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"github.com/mellomaths/petin/backend/core/internal/api"
	"github.com/mellomaths/petin/backend/core/internal/api/schemas"
	"github.com/mellomaths/petin/backend/core/internal/config"
	"github.com/mellomaths/petin/backend/core/internal/domain/accounts"
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
	r.Use(middleware.RequestID) // Rate Limiting
	r.Use(middleware.RealIP)    // Rate Limiting, analytics and tracing
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer) // Recover from crashes

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		api.NewJsonResponse(w, http.StatusOK, schemas.HealthCheckResponse{
			Message: "OK",
		})
	})

	accountsSvc := accounts.NewService(repo.New(a.db), a.snowNode)
	accountsHandler := accounts.NewHandler(accountsSvc)
	r.Route("/accounts", func(r chi.Router) {
		r.Post("/", accountsHandler.CreateAccount)
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
