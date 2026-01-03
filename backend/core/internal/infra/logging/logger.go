package logging

import (
	"os"
	"time"

	"github.com/mellomaths/petin/backend/core/internal/infra/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func CreateLogger(cfg *config.Config) *zap.Logger {
	encoderCfg := zap.NewProductionEncoderConfig()
	encoderCfg.TimeKey = "timestamp"
	encoderCfg.EncodeTime = zapcore.TimeEncoderOfLayout(time.RFC3339)

	loggerConfig := zap.Config{
		Level:             zap.NewAtomicLevelAt(zap.InfoLevel),
		Development:       false,
		DisableCaller:     false,
		DisableStacktrace: false,
		Sampling:          nil,
		Encoding:          "json",
		EncoderConfig:     encoderCfg,
		OutputPaths: []string{
			"stderr",
		},
		ErrorOutputPaths: []string{
			"stderr",
		},
		InitialFields: map[string]interface{}{
			"pid":     os.Getpid(),
			"env":     cfg.Environment,
			"service": cfg.ServiceName,
		},
	}

	return zap.Must(loggerConfig.Build())
}

func InitLogger(cfg *config.Config) {
	zap.ReplaceGlobals(CreateLogger(cfg))
}
