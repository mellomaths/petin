-- name: CreateAccount :one
INSERT INTO petin.account (external_id, email, password, status)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetAccountByExternalId :one
SELECT * FROM petin.account WHERE external_id = $1;

-- name: GetAccountByEmail :one
SELECT * FROM petin.account WHERE email = $1;

-- name: UpdateAccount :one
UPDATE petin.account SET email = $2, password = $3, status = $4 WHERE id = $1 RETURNING *;

-- name: DeleteAccount :exec
DELETE FROM petin.account WHERE id = $1;
