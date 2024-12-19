# default: install lint build test

# run project
build:
    docker compose -f ./backend/docker-compose.yml build backend --no-cache

start:
    docker compose -f ./backend/docker-compose.yml --profile ci up -d

dev:
    docker compose -f ./backend/docker-compose.yml --profile dev up -d

backend:
    docker compose -f ./backend/docker-compose.yml up -d

# run tests
tests:
    cd backend && yarn test
