package main

import (
	"context"
	"os"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5"
	"github.com/mellomaths/petin/backend/core/internal/infra/config"
	"github.com/mellomaths/petin/backend/core/internal/infra/logging"
	"go.uber.org/zap"
)

func main() {
	ctx := context.Background()
	cfg := config.InitConfig()
	logging.InitLogger(&cfg)
	zap.L().Info("connecting to postgres database")
	dbConn, err := pgx.Connect(ctx, cfg.Db.URL)
	if err != nil {
		zap.L().Error("failed to connect to postgres database", zap.Error(err))
		os.Exit(1)
	}
	defer dbConn.Close(ctx)
	zap.L().Info("connected to postgres database")
	snowNode, err := snowflake.NewNode(cfg.SnowflakeIdNode)
	if err != nil {
		zap.L().Error("failed to create snowflake node", zap.Error(err))
		os.Exit(1)
	}
	api := NewRESTAPIServer(cfg, dbConn, snowNode)
	zap.L().Info("starting REST API server")
	if err := api.Run(api.Mount()); err != nil {
		zap.L().Error("failed to run server", zap.Error(err))
		os.Exit(1)
	}
}
