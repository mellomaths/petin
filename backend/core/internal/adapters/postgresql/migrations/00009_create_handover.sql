-- +goose Up
-- +goose StatementBegin
CREATE TABLE petin.handover (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    conversation_id BIGINT NOT NULL REFERENCES petin.conversation(id),
    pet_id BIGINT NOT NULL REFERENCES petin.pet(id),
    owner_profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    adopter_profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    scheduled_date TIMESTAMP,
    location_name VARCHAR(255),
    location_address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_address_id BIGINT REFERENCES petin.address(id),
    location_change_requested BOOLEAN NOT NULL DEFAULT false,
    location_change_requested_by BIGINT REFERENCES petin.profile(id),
    location_change_proposal TEXT,
    owner_confirmed BOOLEAN NOT NULL DEFAULT false,
    adopter_confirmed BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

ALTER TABLE petin.pet ADD COLUMN IF NOT EXISTS current_owner_profile_id BIGINT REFERENCES petin.profile(id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE petin.pet DROP COLUMN IF EXISTS current_owner_profile_id;
DROP TABLE IF EXISTS petin.handover;
-- +goose StatementEnd

