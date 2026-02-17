create or replace function public.pcos_dataset_stats()
returns jsonb
language sql
security definer
as $$
  with totals as (
    select count(*)::numeric as total from public.pcos_dataset_raw
  ),
  cycle as (
    select cycle_length, count(*)::numeric as cnt
    from public.pcos_dataset_raw
    group by cycle_length
    order by cnt desc
    limit 1
  ),
  period as (
    select period_length, count(*)::numeric as cnt
    from public.pcos_dataset_raw
    group by period_length
    order by cnt desc
    limit 1
  ),
  pcos_yes as (
    select count(*)::numeric as yes_count
    from public.pcos_dataset_raw
    where lower(pcos) = 'yes'
  )
  select jsonb_build_object(
    'total', totals.total,
    'top_cycle_length', cycle.cycle_length,
    'top_period_length', period.period_length,
    'pcos_yes_percent', case
      when totals.total = 0 then null
      else round((pcos_yes.yes_count / totals.total) * 100.0, 1)
    end
  )
  from totals
  left join cycle on true
  left join period on true
  left join pcos_yes on true;
$$;

grant execute on function public.pcos_dataset_stats() to anon;
