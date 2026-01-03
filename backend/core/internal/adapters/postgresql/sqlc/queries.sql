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

-- name: CreateAddress :one
INSERT INTO petin.address (external_id, address_line, street_number, city, state, country_code, zip_code, latitude, longitude)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: CreateProfile :one
INSERT INTO petin.profile (external_id, account_id, fullname, document_number, document_type, birthdate, bio, gender, phone_number, address_id, avatar)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

-- name: GetProfileByAccountExternalID :one
SELECT 
    p.*,
    ad.address_line,
    ad.street_number,
    ad.city,
    ad.state,
    ad.country_code,
    ad.zip_code,
    ad.latitude,
    ad.longitude,
    a.external_id as account_external_id,
    a.email as account_email,
    a.status as account_status,
    a.created_at as account_created_at,
    a.updated_at as account_updated_at
FROM petin.profile p
INNER JOIN petin.account a ON p.account_id = a.id
INNER JOIN petin.address ad ON p.address_id = ad.id
WHERE a.external_id = $1;
