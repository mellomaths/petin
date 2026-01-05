package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	Environment     string
	ServiceName     string
	Db              DbConfig
	SnowflakeIdNode int64
	JWT             JWTConfig
}

type JWTConfig struct {
	Secret string
	Expiry int // in hours
}

type DbConfig struct {
	URL string
}

func InitConfig() Config {
	if os.Getenv("ENVIRONMENT") != "production" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("error loading .env file", err)
		}
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "0.0.0.0:3333" // Bind to all interfaces for emulator access
	} else if len(port) > 0 && port[0] == ':' {
		// If port starts with ':', prepend 0.0.0.0 to bind to all interfaces
		port = "0.0.0.0" + port
	} else if port != "" && !strings.Contains(port, ":") {
		// If port is just a number, add 0.0.0.0:
		port = "0.0.0.0:" + port
	}
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "development"
	}
	databaseURL := os.Getenv("GOOSE_DBSTRING")
	if databaseURL == "" {
		log.Fatal("error loading environment variable GOOSE_DBSTRING")
	}
	snowflakeIdNode := os.Getenv("SNOWFLAKE_ID_NODE")
	if snowflakeIdNode == "" {
		snowflakeIdNode = "1"
	}
	snowflakeIdNodeInt, err := strconv.ParseInt(snowflakeIdNode, 10, 64)
	if err != nil {
		log.Fatal("error parsing environment variable SNOWFLAKE_ID_NODE", err)
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("error loading environment variable JWT_SECRET")
	}
	jwtExpiry := os.Getenv("JWT_EXPIRY_HOURS")
	if jwtExpiry == "" {
		jwtExpiry = "24"
	}
	jwtExpiryInt, err := strconv.Atoi(jwtExpiry)
	if err != nil {
		log.Fatal("error parsing environment variable JWT_EXPIRY_HOURS", err)
	}
	return Config{
		Port:            port,
		Environment:     environment,
		ServiceName:     "petin-backend-core",
		SnowflakeIdNode: snowflakeIdNodeInt,
		Db: DbConfig{
			URL: databaseURL,
		},
		JWT: JWTConfig{
			Secret: jwtSecret,
			Expiry: jwtExpiryInt,
		},
	}
}
