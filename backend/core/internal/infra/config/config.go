package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	Environment     string
	ServiceName     string
	Db              DbConfig
	SnowflakeIdNode int64
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
		port = ":3333"
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
	return Config{
		Port:            port,
		Environment:     environment,
		ServiceName:     "petin-backend-core",
		SnowflakeIdNode: snowflakeIdNodeInt,
		Db: DbConfig{
			URL: databaseURL,
		},
	}
}
