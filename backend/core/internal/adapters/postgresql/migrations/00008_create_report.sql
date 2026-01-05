-- +goose Up
-- +goose StatementBegin
CREATE TABLE petin.report (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    reporter_profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    reported_profile_id BIGINT NOT NULL REFERENCES petin.profile(id),
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS petin.report;
-- +goose StatementEnd

