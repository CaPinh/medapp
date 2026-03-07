-- =============================================
-- MedApp - Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- PATIENTS
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  birth_date date,
  notes text,
  created_at timestamptz default now()
);

-- APPOINTMENTS
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  date date not null,
  time time not null,
  duration_min int default 30,
  type text default 'Consulta',
  status text default 'scheduled' check (status in ('scheduled','confirmed','cancelled','completed')),
  notes text,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_appointments_date on appointments(date);
create index if not exists idx_appointments_patient on appointments(patient_id);
create index if not exists idx_appointments_status on appointments(status);

-- RLS (Row Level Security) - disable for single-user app or add auth later
alter table patients enable row level security;
alter table appointments enable row level security;

-- Allow all for service role (used in API routes)
create policy "service_role_all_patients" on patients
  for all using (true);

create policy "service_role_all_appointments" on appointments
  for all using (true);
