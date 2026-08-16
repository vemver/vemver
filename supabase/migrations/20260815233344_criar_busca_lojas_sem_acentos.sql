create or replace function public.buscar_lojas_sem_acentos(
  p_criterios text[],
  p_cidade text default null,
  p_uf text default null
)
returns setof public.lojas
language sql
stable
security invoker
set search_path = ''
as $function$

  select l.*
  from public.lojas as l

  where l.ativo = true
    and l.status = 'aprovada'

    and (
      p_cidade is null
      or btrim(p_cidade) = ''
      or lower(
        extensions.unaccent(
          coalesce(l.cidade, '')
        )
      ) =
      lower(
        extensions.unaccent(
          btrim(p_cidade)
        )
      )
    )

    and (
      p_uf is null
      or btrim(p_uf) = ''
      or upper(
        coalesce(l.uf, '')
      ) =
      upper(
        btrim(p_uf)
      )
    )

    and (
      coalesce(
        array_length(
          p_criterios,
          1
        ),
        0
      ) = 0

      or exists (
        select 1
        from unnest(
          p_criterios
        ) as criterio

        where btrim(
          coalesce(
            criterio,
            ''
          )
        ) <> ''

        and (
          lower(
            extensions.unaccent(
              coalesce(
                l.nome,
                ''
              )
            )
          )
          like
          '%' ||
          lower(
            extensions.unaccent(
              btrim(criterio)
            )
          ) ||
          '%'

          or

          lower(
            extensions.unaccent(
              coalesce(
                l.categoria,
                ''
              )
            )
          )
          like
          '%' ||
          lower(
            extensions.unaccent(
              btrim(criterio)
            )
          ) ||
          '%'

          or

          lower(
            extensions.unaccent(
              coalesce(
                l.descricao,
                ''
              )
            )
          )
          like
          '%' ||
          lower(
            extensions.unaccent(
              btrim(criterio)
            )
          ) ||
          '%'
        )
      )
    );

$function$;


revoke execute
on function public.buscar_lojas_sem_acentos(
  text[],
  text,
  text
)
from public;


revoke execute
on function public.buscar_lojas_sem_acentos(
  text[],
  text,
  text
)
from anon;


revoke execute
on function public.buscar_lojas_sem_acentos(
  text[],
  text,
  text
)
from authenticated;


grant execute
on function public.buscar_lojas_sem_acentos(
  text[],
  text,
  text
)
to service_role;