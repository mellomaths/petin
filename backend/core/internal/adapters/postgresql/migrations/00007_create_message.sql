-- +goose Up
-- +goose StatementBegin
CREATE TABLE petin.message (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    conversation_id BIGINT NOT NULL REFERENCES petin.conversation(id),
    sender_profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS petin.message;
-- +goose StatementEnd

