-- +goose Up
-- +goose StatementBegin
CREATE SCHEMA petin;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP SCHEMA IF EXISTS petin CASCADE;
-- +goose StatementEnd
