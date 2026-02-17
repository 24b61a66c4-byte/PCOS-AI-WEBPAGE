# Supabase Setup (Public Write, Private Read)

## 1) Create project
- Create a new Supabase project and wait for it to be ready.
- Find your project URL and anon key in **Project Settings → API**.

## 2) Create table
Run this SQL in the Supabase SQL editor:

```sql
create table if not exists public.pcos_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  age integer,
  weight numeric,
  height numeric,
  cycle_length integer,
  period_length integer,
  last_period date,
  symptoms text[],
  activity text,
  sleep numeric,
  stress text,
  diet text,
  city text,
  pcos text,
  medications text,
  timestamp text
);

alter table public.pcos_entries enable row level security;

create policy "public insert" on public.pcos_entries
  for insert
  to anon
  with check (true);

create policy "no select" on public.pcos_entries
  for select
  to anon
  using (false);
```

## 3) Add keys in the frontend
Update these placeholders in [frontend/app.js](frontend/app.js):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 4) Test
- Open the form page and submit an entry.
- Verify the row appears in Supabase (Table Editor).

Notes:
- This allows anyone to insert, but not read from the public web.
- You can tighten or change policies later.
