create table if not exists public.cafeteria_survey (
  id bigint generated always as identity primary key,
  taste smallint not null check (taste between -2 and 2),
  menu smallint not null check (menu between -2 and 2),
  salt smallint not null check (salt between -2 and 2),
  temperature smallint not null check (temperature between -2 and 2),
  nutrition smallint not null check (nutrition between -2 and 2),
  hygiene smallint not null check (hygiene between -2 and 2),
  service smallint not null check (service between -2 and 2),
  reason text,
  improvement text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.cafeteria_survey enable row level security;

drop policy if exists "allow anonymous insert cafeteria survey" on public.cafeteria_survey;
create policy "allow anonymous insert cafeteria survey"
  on public.cafeteria_survey
  for insert
  to anon
  with check (true);
