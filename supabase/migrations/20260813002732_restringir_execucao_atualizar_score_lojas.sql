revoke execute
on function public.atualizar_score_lojas()
from public;

revoke execute
on function public.atualizar_score_lojas()
from anon;

revoke execute
on function public.atualizar_score_lojas()
from authenticated;

grant execute
on function public.atualizar_score_lojas()
to service_role;