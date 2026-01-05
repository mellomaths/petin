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

-- name: CreatePet :one
INSERT INTO petin.pet (external_id, profile_id, name, species, breed, age, gender, size, description, photos, is_available_for_adoption, current_owner_profile_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *;

-- name: GetPet :one
SELECT * FROM petin.pet WHERE external_id = $1;

-- name: UpdatePet :one
UPDATE petin.pet 
SET name = $2, species = $3, breed = $4, age = $5, gender = $6, size = $7, description = $8, photos = $9, updated_at = NOW()
WHERE external_id = $1
RETURNING *;

-- name: UpdatePetAvailability :one
UPDATE petin.pet 
SET is_available_for_adoption = $2, updated_at = NOW()
WHERE external_id = $1
RETURNING *;

-- name: GetPetsByProfileID :many
SELECT * FROM petin.pet WHERE profile_id = $1 ORDER BY created_at DESC;

-- name: GetAvailablePetsNearby :many
SELECT 
    p.*,
    pr.external_id as profile_external_id,
    pr.fullname as owner_name,
    pr.avatar as owner_avatar,
    ad.latitude as owner_latitude,
    ad.longitude as owner_longitude,
    SQRT(POWER(ad.latitude - $1, 2) + POWER(ad.longitude - $2, 2)) as distance
FROM petin.pet p
INNER JOIN petin.profile pr ON p.profile_id = pr.id
INNER JOIN petin.address ad ON pr.address_id = ad.id
WHERE p.is_available_for_adoption = true
ORDER BY distance
LIMIT $3;

-- name: CreateConversation :one
INSERT INTO petin.conversation (external_id, pet_id, adopter_profile_id, owner_profile_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetConversation :one
SELECT * FROM petin.conversation WHERE external_id = $1;

-- name: GetConversationsByProfileID :many
SELECT * FROM petin.conversation 
WHERE adopter_profile_id = $1 OR owner_profile_id = $1
ORDER BY created_at DESC;

-- name: GetConversationByID :one
SELECT * FROM petin.conversation WHERE id = $1;

-- name: CreateMessage :one
INSERT INTO petin.message (external_id, conversation_id, sender_profile_id, content)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetMessagesByConversationID :many
SELECT * FROM petin.message 
WHERE conversation_id = $1
ORDER BY created_at ASC;

-- name: CreateReport :one
INSERT INTO petin.report (external_id, reporter_profile_id, reported_profile_id, reason, description, status)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetReport :one
SELECT * FROM petin.report WHERE external_id = $1;

-- name: CreateHandover :one
INSERT INTO petin.handover (external_id, conversation_id, pet_id, owner_profile_id, adopter_profile_id, scheduled_date, location_name, location_address, latitude, longitude, location_address_id, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *;

-- name: GetHandover :one
SELECT * FROM petin.handover WHERE external_id = $1;

-- name: UpdateHandoverLocation :one
UPDATE petin.handover 
SET location_name = $2, location_address = $3, latitude = $4, longitude = $5, location_address_id = $6, location_change_requested = $7, location_change_requested_by = $8, location_change_proposal = $9, updated_at = NOW()
WHERE external_id = $1
RETURNING *;

-- name: UpdateHandoverScheduledDate :one
UPDATE petin.handover 
SET scheduled_date = $2, status = $3, updated_at = NOW()
WHERE external_id = $1
RETURNING *;

-- name: ConfirmHandover :one
UPDATE petin.handover 
SET owner_confirmed = $2, adopter_confirmed = $3, status = $4, completed_at = $5, updated_at = NOW()
WHERE external_id = $1
RETURNING *;

-- name: GetHandoversByProfileID :many
SELECT * FROM petin.handover 
WHERE owner_profile_id = $1 OR adopter_profile_id = $1
ORDER BY created_at DESC;

-- name: GetPetByID :one
SELECT * FROM petin.pet WHERE id = $1;

-- name: UpdatePetCurrentOwner :one
UPDATE petin.pet 
SET current_owner_profile_id = $2, updated_at = NOW()
WHERE external_id = $1
RETURNING *;