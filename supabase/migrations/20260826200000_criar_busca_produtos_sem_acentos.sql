create or replace function public.buscar_produtos_sem_acentos(
  p_criterios text[],
  p_cidade text default null,
  p_uf text default null
)
returns table (
  id bigint,
  nome text,
  descricao text,
  preco numeric,
  preco_promocional numeric,
  imagem_url text,
  loja_id bigint,
  categoria text,
  marca text,
  promocao boolean
)
language sql
stable
security invoker
set search_path = ''
as $function$

  select
    p.id,
    p.nome,
    p.descricao,
    p.preco,
    p.preco_promocional,
    p.imagem_url,
    p.loja_id,
    p.categoria,
    p.marca,
    p.promocao

  from public.produtos as p

  inner join public.lojas as l
    on l.id = p.loja_id

  where p.ativo = true
    and l.ativo = true
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
                p.nome,
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
                p.descricao,
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
                p.categoria,
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
                p.marca,
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
on function public.buscar_produtos_sem_acentos(
  text[],
  text,
  text
)
from public;


revoke execute
on function public.buscar_produtos_sem_acentos(
  text[],
  text,
  text
)
from anon;


revoke execute
on function public.buscar_produtos_sem_acentos(
  text[],
  text,
  text
)
from authenticated;


grant execute
on function public.buscar_produtos_sem_acentos(
  text[],
  text,
  text
)
to service_role;