-- name: CreateAccount :one
INSERT INTO petin.account (external_id, email, password, status)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetAccount :one
SELECT * FROM petin.account WHERE external_id = $1;

-- name: GetAccountByEmail :one
SELECT * FROM petin.account WHERE email = $1;

-- name: UpdateAccountStatus :one
UPDATE petin.account SET status = $2, updated_at = NOW() WHERE external_id = $1 RETURNING *;
