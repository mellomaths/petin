# default: install lint build test

# run project
start:
    docker compose --profile ci up -d

database:
    docker compose --profile db up -d

# run project dev environment
dev:
    docker compose --profile dev up -d

# run frontend
frontend:
    docker compose --profile frontend up -d

# run backend
backend:
    docker compose --profile backend up -d

stop:
    docker compose down

# run tests
tests:
    cd backend && yarn test
