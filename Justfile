# default: install lint build test

# run project
petin:
    docker compose --profile ci up -d

# run project dev environment
petin-dev:
    docker compose --profile dev up -d

# run frontend
petin-frontend:
    docker compose --profile frontend up -d

# run backend
petin-backend:
    docker compose --profile backend up -d

docker-down:
    docker compose down

# run tests
tests:
    cd backend && yarn test
