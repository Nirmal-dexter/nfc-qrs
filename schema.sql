-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Shops
create table if not exists shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text not null,
  notes text,
  created_at timestamptz default now()
);

-- Cards
create table if not exists cards (
  id uuid primary key default uuid_generate_v4(),
  code varchar(6) unique not null,
  card_number serial,
  batch_name text not null default 'Default',
  shop_id uuid references shops(id) on delete set null,
  custom_url text,
  status text not null default 'unassigned' check (status in ('unassigned','assigned','disabled')),
  is_neglected boolean not null default false,
  created_at timestamptz default now(),
  assigned_at timestamptz
);

-- Migration helper if table already exists:
-- alter table cards add column if not exists is_neglected boolean not null default false;

-- Scans
create table if not exists scans (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid references cards(id) on delete cascade,
  scanned_at timestamptz default now(),
  user_agent text,
  country text
);

-- Admins
create table if not exists admins (
  email text primary key
);

-- Row Level Security
alter table shops enable row level security;
alter table cards enable row level security;
alter table scans enable row level security;
alter table admins enable row level security;

-- No public access (service role bypasses RLS)
create policy "No public access" on shops for all using (false);
create policy "No public access" on cards for all using (false);
create policy "No public access" on scans for all using (false);
create policy "No public access" on admins for all using (false);
