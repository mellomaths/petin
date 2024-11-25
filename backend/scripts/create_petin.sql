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
