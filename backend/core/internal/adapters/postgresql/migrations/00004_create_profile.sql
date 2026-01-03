-- +goose Up
-- +goose StatementBegin
CREATE TABLE petin.profile (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    account_id BIGINT NOT NULL REFERENCES petin.account(id),
    fullname VARCHAR(255) NOT NULL,
    document_number VARCHAR(255) NOT NULL,
    document_type VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    bio TEXT NOT NULL,
    gender VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    address_id BIGINT NOT NULL REFERENCES petin.address(id),
    avatar TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS petin.profile;
-- +goose StatementEnd
