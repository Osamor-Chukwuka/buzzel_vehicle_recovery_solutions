-- Full audit history is a Super Admin capability.
drop policy if exists audit_select_admin on public.audit_logs;
create policy audit_select_super_admin on public.audit_logs
for select to authenticated
using ((select private.is_super_admin()));
