-- Read access: anyone with the anon key can read leads and activities.
create policy "anon read leads" on leads
  for select using (true);
create policy "anon read activities" on activities
  for select using (true);

-- Writes are intentionally NOT exposed as direct table policies for anon/authenticated.
-- Instead, the two functions below run as SECURITY DEFINER (elevated privilege) but only
-- do exactly what their signature allows, so the app can call them with the public anon
-- key without ever holding the service-role secret. See README "Trade-offs".

create or replace function public.create_lead_from_webhook(payload jsonb)
returns leads
language plpgsql
security definer
set search_path = public
as $$
declare
  new_lead leads;
begin
  insert into leads (full_name, email, phone, campaign_name, ad_id, form_id, raw_payload)
  values (
    coalesce(payload->>'full_name', payload->>'name', 'Unknown'),
    payload->>'email',
    payload->>'phone',
    payload->>'campaign_name',
    payload->>'ad_id',
    payload->>'form_id',
    payload
  )
  returning * into new_lead;

  insert into activities (lead_id, type, message, metadata)
  values (new_lead.id, 'lead_created', 'Lead created from Meta Ads webhook', jsonb_build_object('source', 'meta_ads_webhook'));

  return new_lead;
end;
$$;

create or replace function public.update_lead_status(p_lead_id uuid, p_new_status lead_status)
returns leads
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_lead leads;
  old_status lead_status;
begin
  select status into old_status from leads where id = p_lead_id;

  if old_status is null then
    raise exception 'Lead not found';
  end if;

  update leads
  set status = p_new_status, updated_at = now()
  where id = p_lead_id
  returning * into updated_lead;

  insert into activities (lead_id, type, message, metadata)
  values (
    p_lead_id,
    'status_changed',
    format('Status changed from %s to %s', old_status, p_new_status),
    jsonb_build_object('from', old_status, 'to', p_new_status)
  );

  return updated_lead;
end;
$$;

grant execute on function public.create_lead_from_webhook(jsonb) to anon, authenticated;
grant execute on function public.update_lead_status(uuid, lead_status) to anon, authenticated;
