-- +goose Up
-- +goose StatementBegin
CREATE TABLE petin.address (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    street_number VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country_code VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS petin.address;
-- +goose StatementEnd
