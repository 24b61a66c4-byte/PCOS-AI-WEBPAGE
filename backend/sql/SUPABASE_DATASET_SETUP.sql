create table if not exists public.pcos_dataset_raw (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  period_length text,
  cycle_length text,
  age text,
  city text,
  pcos text,
  pcos_from text,
  overweight text,
  weight_change text,
  irregular_missed_periods text,
  difficulty_conceiving text,
  hair_growth_chin text,
  hair_growth_cheeks text,
  hair_growth_between_breasts text,
  hair_growth_upper_lip text,
  hair_growth_arms text,
  hair_growth_inner_thighs text,
  acne_or_skin_tags text,
  hair_thinning_or_hair_loss text,
  dark_patches text,
  always_tired text,
  mood_swings text,
  exercise_per_week text,
  eat_outside_per_week text,
  canned_food_often text,
  relocated_city text
);

alter table public.pcos_dataset_raw enable row level security;

create policy "no select" on public.pcos_dataset_raw
  for select
  to anon
  using (false);

create policy "no write" on public.pcos_dataset_raw
  for insert
  to anon
  with check (false);
