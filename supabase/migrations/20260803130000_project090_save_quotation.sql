-- Project 090.2 — atomic quotation create (header + line items).
-- Persists into finance_records (type=quotation) + finance_line_items
-- inside a single Postgres transaction (function body).

create or replace function public.create_finance_quotation_with_items(
  p_record jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_finance public.finance_records%rowtype;
  v_item jsonb;
  v_pos integer := 0;
  v_line public.finance_line_items%rowtype;
  v_lines jsonb := '[]'::jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'line items required';
  end if;

  insert into public.finance_records (
    company_id,
    workspace_id,
    project_id,
    client_id,
    vendor_id,
    type,
    category,
    currency,
    amount,
    tax,
    discount,
    status,
    reference_number,
    issued_at,
    due_at,
    notes,
    internal_notes,
    created_by,
    updated_by
  ) values (
    (p_record->>'company_id')::uuid,
    (p_record->>'workspace_id')::uuid,
    nullif(p_record->>'project_id', '')::uuid,
    nullif(p_record->>'client_id', '')::uuid,
    nullif(p_record->>'vendor_id', '')::uuid,
    coalesce(p_record->>'type', 'quotation'),
    coalesce(p_record->>'category', 'general'),
    coalesce(p_record->>'currency', 'USD'),
    coalesce((p_record->>'amount')::numeric, 0),
    coalesce((p_record->>'tax')::numeric, 0),
    coalesce((p_record->>'discount')::numeric, 0),
    coalesce(p_record->>'status', 'draft'),
    nullif(p_record->>'reference_number', ''),
    nullif(p_record->>'issued_at', '')::timestamptz,
    nullif(p_record->>'due_at', '')::timestamptz,
    nullif(p_record->>'notes', ''),
    nullif(p_record->>'internal_notes', ''),
    (p_record->>'created_by')::uuid,
    nullif(p_record->>'updated_by', '')::uuid
  )
  returning * into v_finance;

  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    insert into public.finance_line_items (
      finance_id,
      company_id,
      workspace_id,
      position,
      description,
      quantity,
      unit_price,
      tax,
      discount,
      amount
    ) values (
      v_finance.id,
      v_finance.company_id,
      v_finance.workspace_id,
      v_pos,
      v_item->>'description',
      coalesce((v_item->>'quantity')::numeric, 1),
      coalesce((v_item->>'unit_price')::numeric, 0),
      coalesce((v_item->>'tax')::numeric, 0),
      coalesce((v_item->>'discount')::numeric, 0),
      coalesce((v_item->>'amount')::numeric, 0)
    )
    returning * into v_line;

    v_lines := v_lines || jsonb_build_array(to_jsonb(v_line));
    v_pos := v_pos + 1;
  end loop;

  return jsonb_build_object(
    'finance', to_jsonb(v_finance),
    'line_items', v_lines
  );
end;
$$;

revoke all on function public.create_finance_quotation_with_items(jsonb, jsonb) from public;
revoke all on function public.create_finance_quotation_with_items(jsonb, jsonb) from anon, authenticated;
grant execute on function public.create_finance_quotation_with_items(jsonb, jsonb) to service_role;

comment on function public.create_finance_quotation_with_items(jsonb, jsonb) is
  'Project 090.2: atomically insert finance_records + finance_line_items for a quotation.';
