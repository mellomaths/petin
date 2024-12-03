drop schema if exists petin cascade;

create schema petin;

create table petin.account (
	account_id uuid primary key,
	email text not null,
	password text not null,
	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);

create table petin.address (
	address_id uuid primary key,
	street text not null,
	street_number text not null,
	city text not null,
	state text not null,
	country_code text not null,
	zip_code text not null,
	latitude numeric not null,
	longitude numeric not null,
	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);

create table petin.profile (
	profile_id uuid primary key,
	account_id uuid not null references petin.account(account_id),
	fullname text not null,
	document_number text not null,
	birthdate timestamp not null,
	bio text not null,
	gender text not null,
	phone_number text not null,
	address_id uuid not null references petin.address(address_id),
	avatar text null,
	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);

create table petin.pet (
	pet_id uuid primary key,
	owner_account_id uuid not null references petin.account(account_id),
	name text not null,
	birthday timestamp not null,
	bio text not null,
	sex text not null,
	type text not null,
	donation boolean not null,
	adopted boolean not null,
	archived boolean not null,
	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);
