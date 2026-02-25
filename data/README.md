# Supabase Dataset Import (Raw CSV)

## Why a separate table
- Keeps training/data exploration separate from user submissions.
- Avoids mixing raw survey strings with structured app entries.
- Easier to update/replace the dataset later.

## 1) Create the raw table
Run the SQL in [backend/sql/SUPABASE_DATASET_SETUP.sql](backend/sql/SUPABASE_DATASET_SETUP.sql).

## 2) Prepare CSV headers
Your CSV headers map to the table columns like this:

- Period Length -> period_length
- Cycle Length -> cycle_length
- Age -> age
- City -> city
- PCOS -> pcos
- PCOS_from -> pcos_from
- Overweight -> overweight
- loss weight gain / weight loss -> weight_change
- irregular or missed periods -> irregular_missed_periods
- Difficulty in conceiving -> difficulty_conceiving
- Hair growth on Chin -> hair_growth_chin
- Hair growth  on Cheeks -> hair_growth_cheeks
- Hair growth Between breasts -> hair_growth_between_breasts
- Hair growth  on Upper lips  -> hair_growth_upper_lip
- Hair growth in Arms -> hair_growth_arms
- Hair growth on Inner thighs -> hair_growth_inner_thighs
- Acne or skin tags -> acne_or_skin_tags
- Hair thinning or hair loss  -> hair_thinning_or_hair_loss
- Dark patches -> dark_patches
- always tired -> always_tired
- more Mood Swings -> mood_swings
- exercise per week -> exercise_per_week
- eat outside per week -> eat_outside_per_week
- canned food often -> canned_food_often
- relocated city -> relocated_city

If you want, I can rename the CSV headers for you to match the table columns.

## 3) Import into Supabase
- Open Table Editor -> pcos_dataset_raw -> Import Data.
- Upload the CSV file.
- Confirm column mapping.
- Import.

## 4) Keep it private
RLS policies in the SQL disable public reads/writes for anon users.

If you want analytics queries later, we can add a secure server-side function.
