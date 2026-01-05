-- +goose Up
-- +goose StatementBegin
CREATE TABLE petin.pet (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    name VARCHAR(255) NOT NULL,
    species VARCHAR(255) NOT NULL,
    breed VARCHAR(255),
    age INTEGER,
    gender VARCHAR(255),
    size VARCHAR(255),
    description TEXT,
    photos TEXT[],
    is_available_for_adoption BOOLEAN NOT NULL DEFAULT false,
    current_owner_profile_id BIGINT REFERENCES petin.profile(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS petin.pet;
-- +goose StatementEnd

