drop schema if exists petin cascade;

create schema petin;

create table petin.pet (
	pet_id uuid primary key,
	name text not null,
	birthday timestamp not null,
	bio text not null,
	sex text not null,
	type text not null,
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
	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);

create table petin.owner (
	owner_id uuid primary key,
	fullname text not null,
	email text not null,
	password text not null,
	document_number text not null,
	birthday timestamp not null,
	bio text not null,
	gender text not null,
	phone_number text not null,
	address_id uuid not null references petin.address(address_id),
	avatar text null,
	created_at timestamp not null default now(),
	updated_at timestamp not null default now()
);
