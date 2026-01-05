-- +goose Up
-- +goose StatementBegin
CREATE TABLE petin.conversation (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    pet_id BIGINT NOT NULL REFERENCES petin.pet(id),
    adopter_profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    owner_profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS petin.conversation;
-- +goose StatementEnd

