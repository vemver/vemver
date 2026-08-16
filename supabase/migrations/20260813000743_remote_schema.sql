-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE SEQUENCE public.avaliacoes_id_seq;

CREATE SEQUENCE public.solicitacoes_planos_id_seq;

CREATE FUNCTION public.atualizar_score_lojas()
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin

    update lojas
    set score =
    (
        case
            when patrocinado = true then 60
            when premium = true then 30
            else 0
        end

        +

        least(coalesce(visualizacoes, 0), 500) / 10

        +

        least(
            (
                select count(*)
                from produtos
                where produtos.loja_id = lojas.id
                and ativo = true
            ),
            30
        )

        +

        least(
            (
                select count(*)
                from favoritos
                where favoritos.loja_id = lojas.id
            ) * 2,
            50
        )

        +

        least(
            (
                select coalesce(avg(nota), 0)
                from avaliacoes
                where avaliacoes.loja_id = lojas.id
                and aprovado = true
            ) * 5,
            25
        )
    )

    where true;

end;
$function$;

GRANT ALL ON FUNCTION public.atualizar_score_lojas() TO anon;

GRANT ALL ON FUNCTION public.atualizar_score_lojas() TO authenticated;

GRANT ALL ON FUNCTION public.atualizar_score_lojas() TO service_role;

CREATE FUNCTION public.proteger_campos_sensiveis_lojas()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
declare
  email_usuario text :=
    lower(coalesce(auth.jwt() ->> 'email', ''));

  funcao_usuario text :=
    coalesce(auth.role(), '');
begin
  /*
    Permite alterações administrativas realizadas:
    - pelo SQL Editor;
    - pela chave service_role;
    - pela conta oficial do administrador.
  */
  if current_user in ('postgres', 'supabase_admin')
     or funcao_usuario = 'service_role'
     or email_usuario = 'vemverapp@gmail.com'
  then
    return new;
  end if;

  /*
    Confirma que a loja realmente pertence
    ao usuário autenticado.
  */
  if auth.uid() is null
     or old.user_id is distinct from auth.uid()
  then
    raise exception
      'Você não possui permissão para alterar esta loja.'
      using errcode = '42501';
  end if;

  /*
    Impede o lojista de alterar campos administrativos,
    comerciais ou relacionados à assinatura.
  */
  if
    new.id is distinct from old.id
    or new.created_at is distinct from old.created_at
    or new.user_id is distinct from old.user_id
    or new.premium is distinct from old.premium
    or new.ativo is distinct from old.ativo
    or new.status is distinct from old.status
    or new.plano is distinct from old.plano
    or new.limite_lojas is distinct from old.limite_lojas
    or new.visualizacoes is distinct from old.visualizacoes
    or new.patrocinado is distinct from old.patrocinado
    or new.score is distinct from old.score
    or new.plano_periodo is distinct from old.plano_periodo
    or new.plano_inicio is distinct from old.plano_inicio
    or new.plano_vencimento is distinct from old.plano_vencimento
    or new.assinatura_status is distinct from old.assinatura_status
    or new.renovacao_automatica is distinct from old.renovacao_automatica
    or new.assinatura_id is distinct from old.assinatura_id
    or new.cortesia_ate is distinct from old.cortesia_ate
    or new.aviso_7_dias is distinct from old.aviso_7_dias
    or new.aviso_3_dias is distinct from old.aviso_3_dias
    or new.aviso_1_dia is distinct from old.aviso_1_dia
    or new.aviso_vencido is distinct from old.aviso_vencido
  then
    raise exception
      'Campos administrativos e de assinatura não podem ser alterados pelo lojista.'
      using errcode = '42501';
  end if;

  /*
    Continuam permitidos:
    nome, categoria, WhatsApp, cidade, endereço,
    descrição, imagem, Instagram, latitude e longitude.
  */
  return new;
end;
$function$;

GRANT ALL ON FUNCTION public.proteger_campos_sensiveis_lojas() TO anon;

GRANT ALL ON FUNCTION public.proteger_campos_sensiveis_lojas() TO authenticated;

GRANT ALL ON FUNCTION public.proteger_campos_sensiveis_lojas() TO service_role;

CREATE TABLE public.aceites_legais (
  id           bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id      uuid                     NOT NULL,
  tipo_usuario text                     NOT NULL,
  documento    text                     NOT NULL,
  versao       text                     NOT NULL,
  origem       text                     DEFAULT 'cadastro'::text NOT NULL,
  aceito_em    timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.aceites_legais
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.aceites_legais
  ADD CONSTRAINT aceite_legal_unico UNIQUE (user_id, documento, versao);

ALTER TABLE public.aceites_legais
  ADD CONSTRAINT aceites_legais_documento_check CHECK (documento = ANY (ARRAY['termos_uso'::text, 'politica_privacidade'::text, 'termos_lojista'::text]));

ALTER TABLE public.aceites_legais
  ADD CONSTRAINT aceites_legais_pkey PRIMARY KEY (id);

ALTER TABLE public.aceites_legais
  ADD CONSTRAINT aceites_legais_tipo_usuario_check CHECK (tipo_usuario = ANY (ARRAY['cliente'::text, 'lojista'::text]));

ALTER TABLE public.aceites_legais
  ADD CONSTRAINT aceites_legais_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

GRANT ALL ON public.aceites_legais TO authenticated;

GRANT ALL ON public.aceites_legais TO service_role;

CREATE INDEX aceites_legais_user_id_idx ON public.aceites_legais (user_id);

CREATE POLICY "Usuario registra seus aceites" ON public.aceites_legais
  FOR INSERT
  TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Usuario visualiza seus aceites" ON public.aceites_legais
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.admins (
  id         bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  email      text
);

ALTER TABLE public.admins
  ADD CONSTRAINT admins_pkey PRIMARY KEY (id);

GRANT ALL ON public.admins TO anon;

GRANT ALL ON public.admins TO authenticated;

GRANT ALL ON public.admins TO service_role;

CREATE TABLE public.ads (
  id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id     uuid,
  category_id uuid,
  title       text                     NOT NULL,
  description text,
  price       numeric,
  city        text,
  image_url   text,
  created_at  timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ads
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ads
  ADD CONSTRAINT ads_pkey PRIMARY KEY (id);

GRANT ALL ON public.ads TO anon;

GRANT ALL ON public.ads TO authenticated;

GRANT ALL ON public.ads TO service_role;

CREATE TABLE public.assinaturas (
  id                         bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  loja_id                    bigint                   NOT NULL,
  user_id                    uuid,
  plano_codigo               text                     NOT NULL,
  periodo                    text                     NOT NULL,
  meses                      integer                  NOT NULL,
  valor_pago                 numeric(12,2)            NOT NULL,
  status                     text                     DEFAULT 'pendente'::text NOT NULL,
  data_inicio                timestamp with time zone,
  data_vencimento            timestamp with time zone,
  data_cancelamento          timestamp with time zone,
  renovacao_automatica       boolean                  DEFAULT false NOT NULL,
  mercado_pago_payment_id    text,
  mercado_pago_preference_id text,
  external_reference         text,
  created_at                 timestamp with time zone DEFAULT now() NOT NULL,
  updated_at                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.assinaturas
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assinaturas
  ADD CONSTRAINT assinaturas_periodo_valido CHECK (periodo = ANY (ARRAY['mensal'::text, 'trimestral'::text, 'anual'::text]));

ALTER TABLE public.assinaturas
  ADD CONSTRAINT assinaturas_pkey PRIMARY KEY (id);

ALTER TABLE public.assinaturas
  ADD CONSTRAINT assinaturas_status_valido CHECK (status = ANY (ARRAY['pendente'::text, 'ativa'::text, 'vencida'::text, 'cancelada'::text, 'recusada'::text, 'reembolsada'::text]));

ALTER TABLE public.assinaturas
  ADD CONSTRAINT assinaturas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT ALL ON public.assinaturas TO anon;

GRANT ALL ON public.assinaturas TO authenticated;

GRANT ALL ON public.assinaturas TO service_role;

CREATE UNIQUE INDEX assinaturas_external_reference_idx ON public.assinaturas (external_reference)
  WHERE external_reference IS NOT NULL;

CREATE INDEX assinaturas_loja_id_idx ON public.assinaturas (loja_id);

CREATE INDEX assinaturas_user_id_idx ON public.assinaturas (user_id);

CREATE INDEX assinaturas_status_idx ON public.assinaturas (status);

CREATE INDEX assinaturas_vencimento_idx ON public.assinaturas (data_vencimento);

CREATE TABLE public.ativacoes_manuais_planos (
  id               bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  loja_id          bigint                   NOT NULL,
  plano_id         bigint                   NOT NULL,
  plano_codigo     text                     NOT NULL,
  periodo          text                     NOT NULL,
  meses            integer                  NOT NULL,
  tipo_ativacao    text                     NOT NULL,
  status           text                     DEFAULT 'agendada'::text NOT NULL,
  ativacao_em      timestamp with time zone NOT NULL,
  novo_vencimento  timestamp with time zone NOT NULL,
  plano_anterior   text,
  periodo_anterior text,
  motivo           text                     NOT NULL,
  admin_user_id    uuid                     NOT NULL,
  admin_email      text                     NOT NULL,
  ativado_em       timestamp with time zone,
  cancelado_em     timestamp with time zone,
  created_at       timestamp with time zone DEFAULT now() NOT NULL,
  updated_at       timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.ativacoes_manuais_planos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacao_manual_datas_validas CHECK (novo_vencimento > ativacao_em);

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_meses_check CHECK (meses > 0);

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_motivo_check CHECK (char_length(TRIM(BOTH FROM motivo)) >= 5);

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_periodo_check CHECK (periodo = ANY (ARRAY['mensal'::text, 'trimestral'::text, 'anual'::text]));

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_pkey PRIMARY KEY (id);

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_status_check CHECK (status = ANY (ARRAY['agendada'::text, 'ativada'::text, 'cancelada'::text]));

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_tipo_ativacao_check CHECK (tipo_ativacao = ANY (ARRAY['imediata'::text, 'agendada'::text]));

GRANT ALL ON public.ativacoes_manuais_planos TO anon;

GRANT ALL ON public.ativacoes_manuais_planos TO authenticated;

GRANT ALL ON public.ativacoes_manuais_planos TO service_role;

CREATE UNIQUE INDEX ativacoes_manuais_uma_agendada_por_loja ON public.ativacoes_manuais_planos (loja_id)
  WHERE status = 'agendada'::text;

CREATE POLICY admin_visualiza_ativacoes_manuais ON public.ativacoes_manuais_planos
  FOR SELECT
  TO authenticated
  USING ((lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)) = 'vemverapp@gmail.com'::text));

CREATE TABLE public.avaliacoes (
  id                     bigint                   DEFAULT nextval('public.avaliacoes_id_seq'::regclass) NOT NULL,
  created_at             timestamp with time zone DEFAULT now(),
  loja_id                bigint,
  nome_cliente           text,
  nota                   integer,
  comentario             text,
  aprovado               boolean                  DEFAULT true,
  user_id                uuid,
  moderacao_status       text                     DEFAULT 'pendente'::text NOT NULL,
  moderacao_motivo       text,
  moderacao_categorias   jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  moderacao_score_maximo double precision,
  moderacao_modelo       text,
  moderacao_tentativas   integer                  DEFAULT 0 NOT NULL,
  moderacao_erro         text,
  moderado_em            timestamp with time zone
);

ALTER SEQUENCE public.avaliacoes_id_seq OWNED BY public.avaliacoes.id;

GRANT ALL ON SEQUENCE public.avaliacoes_id_seq TO anon;

GRANT ALL ON SEQUENCE public.avaliacoes_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.avaliacoes_id_seq TO service_role;

ALTER TABLE public.avaliacoes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_nota_check CHECK (nota >= 1 AND nota <= 5);

ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_pkey PRIMARY KEY (id);

ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT ALL ON public.avaliacoes TO anon;

GRANT ALL ON public.avaliacoes TO authenticated;

GRANT ALL ON public.avaliacoes TO service_role;

CREATE UNIQUE INDEX avaliacao_unica_usuario_loja ON public.avaliacoes (user_id, loja_id)
  WHERE user_id IS NOT NULL;

CREATE POLICY "Avaliacoes public insert" ON public.avaliacoes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Avaliacoes public read" ON public.avaliacoes
  FOR SELECT
  USING ((aprovado = true));

CREATE POLICY "Usuario pode atualizar avaliacao" ON public.avaliacoes
  FOR UPDATE
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Usuario pode criar avaliacao" ON public.avaliacoes
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Usuario pode excluir avaliacao" ON public.avaliacoes
  FOR DELETE
  USING ((auth.uid() = user_id));

CREATE POLICY "Usuario pode ver avaliacoes" ON public.avaliacoes
  FOR SELECT
  USING (((aprovado = true) OR (auth.uid() = user_id)));

CREATE TABLE public.categories (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  name       text                     NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.categories
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE public.ads
  ADD CONSTRAINT ads_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);

GRANT ALL ON public.categories TO anon;

GRANT ALL ON public.categories TO authenticated;

GRANT ALL ON public.categories TO service_role;

CREATE TABLE public.favoritos (
  id         bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  user_id    uuid                     NOT NULL,
  loja_id    bigint,
  produto_id bigint,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.favoritos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.favoritos
  ADD CONSTRAINT favorito_tipo_valido CHECK (loja_id IS NOT NULL AND produto_id IS NULL OR loja_id IS NULL AND produto_id IS NOT NULL);

ALTER TABLE public.favoritos
  ADD CONSTRAINT favoritos_pkey PRIMARY KEY (id);

ALTER TABLE public.favoritos
  ADD CONSTRAINT favoritos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

GRANT ALL ON public.favoritos TO anon;

GRANT ALL ON public.favoritos TO authenticated;

GRANT ALL ON public.favoritos TO service_role;

CREATE UNIQUE INDEX favoritos_usuario_produto_unico ON public.favoritos (user_id, produto_id)
  WHERE produto_id IS NOT NULL;

CREATE UNIQUE INDEX favoritos_usuario_loja_unico ON public.favoritos (user_id, loja_id)
  WHERE loja_id IS NOT NULL;

CREATE POLICY "Usuario pode criar seus favoritos" ON public.favoritos
  FOR INSERT
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Usuario pode excluir seus favoritos" ON public.favoritos
  FOR DELETE
  USING ((auth.uid() = user_id));

CREATE POLICY "Usuario pode ver seus favoritos" ON public.favoritos
  FOR SELECT
  USING ((auth.uid() = user_id));

CREATE TABLE public.historico_assinaturas (
  id             bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at     timestamp with time zone DEFAULT now() NOT NULL,
  loja_id        bigint,
  evento         text,
  plano_anterior text,
  plano_novo     text,
  mensagem       text,
  usuario_id     uuid,
  valor          numeric,
  referencia     text
);

ALTER TABLE public.historico_assinaturas
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.historico_assinaturas
  ADD CONSTRAINT historico_assinaturas_pkey PRIMARY KEY (id);

GRANT ALL ON public.historico_assinaturas TO anon;

GRANT ALL ON public.historico_assinaturas TO authenticated;

GRANT ALL ON public.historico_assinaturas TO service_role;

CREATE TABLE public.lojas (
  id                     bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at             timestamp with time zone DEFAULT now() NOT NULL,
  nome                   text,
  categoria              text,
  whatsapp               text,
  cidade                 text,
  endereco               text,
  descricao              text,
  imagem_url             text,
  premium                boolean,
  ativo                  boolean,
  user_id                uuid,
  instagram              text,
  latitude               double precision,
  longitude              double precision,
  status                 text                     DEFAULT 'em_analise'::text,
  plano                  text                     DEFAULT 'gratis'::text,
  limite_lojas           integer                  DEFAULT 1,
  visualizacoes          integer                  DEFAULT 0,
  patrocinado            boolean                  DEFAULT false,
  score                  integer                  DEFAULT 0,
  plano_periodo          text,
  plano_inicio           timestamp with time zone,
  plano_vencimento       timestamp with time zone,
  assinatura_status      text                     DEFAULT 'inativa'::text,
  renovacao_automatica   boolean                  DEFAULT false,
  assinatura_id          bigint,
  cortesia_ate           timestamp with time zone,
  aviso_7_dias           boolean                  DEFAULT false NOT NULL,
  aviso_3_dias           boolean                  DEFAULT false NOT NULL,
  aviso_1_dia            boolean                  DEFAULT false NOT NULL,
  aviso_vencido          boolean                  DEFAULT false NOT NULL,
  uf                     text,
  moderacao_status       text                     DEFAULT 'pendente'::text NOT NULL,
  moderacao_motivo       text,
  moderacao_categorias   jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  moderacao_score_maximo double precision,
  moderacao_modelo       text,
  moderacao_tentativas   integer                  DEFAULT 0 NOT NULL,
  moderacao_erro         text,
  moderado_em            timestamp with time zone
);

ALTER TABLE public.lojas
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lojas
  ADD CONSTRAINT lojas_pkey1 PRIMARY KEY (id);

ALTER TABLE public.assinaturas
  ADD CONSTRAINT assinaturas_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE RESTRICT;

ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;

ALTER TABLE public.favoritos
  ADD CONSTRAINT favoritos_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;

ALTER TABLE public.lojas
  ADD CONSTRAINT lojas_uf_formato_check CHECK (uf IS NULL OR uf ~ '^[A-Z]{2}$'::text);

GRANT ALL ON public.lojas TO anon;

GRANT ALL ON public.lojas TO authenticated;

GRANT ALL ON public.lojas TO service_role;

CREATE INDEX lojas_cidade_uf_idx ON public.lojas (lower(TRIM(BOTH FROM cidade)), uf);

CREATE TRIGGER proteger_campos_sensiveis_lojas
  BEFORE UPDATE ON public.lojas
  FOR EACH ROW
  EXECUTE FUNCTION public.proteger_campos_sensiveis_lojas();

CREATE POLICY admin_atualiza_todas_lojas ON public.lojas
  FOR UPDATE
  TO authenticated
  USING ((lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)) = 'vemverapp@gmail.com'::text))
  WITH CHECK ((lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)) = 'vemverapp@gmail.com'::text));

CREATE POLICY admin_exclui_todas_lojas ON public.lojas
  FOR DELETE
  TO authenticated
  USING ((lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)) = 'vemverapp@gmail.com'::text));

CREATE POLICY admin_visualiza_todas_lojas ON public.lojas
  FOR SELECT
  TO authenticated
  USING ((lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)) = 'vemverapp@gmail.com'::text));

CREATE POLICY lojas_publicas_aprovadas ON public.lojas
  FOR SELECT
  TO anon, authenticated
  USING (((status = 'aprovada'::text) AND (ativo = true)));

CREATE POLICY lojista_atualiza_proprias_lojas ON public.lojas
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY lojista_exclui_proprias_lojas ON public.lojas
  FOR DELETE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY lojista_visualiza_proprias_lojas ON public.lojas
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.moderacoes_conteudo (
  id            bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at    timestamp with time zone DEFAULT now() NOT NULL,
  tipo_conteudo text                     NOT NULL,
  conteudo_id   bigint                   NOT NULL,
  loja_id       bigint,
  user_id       uuid,
  status        text                     NOT NULL,
  motivo        text,
  categorias    jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  score_maximo  double precision,
  modelo        text,
  origem        text                     DEFAULT 'automatica'::text NOT NULL,
  resultado     jsonb,
  revisado_por  uuid,
  revisado_em   timestamp with time zone
);

ALTER TABLE public.moderacoes_conteudo
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.moderacoes_conteudo
  ADD CONSTRAINT moderacoes_conteudo_pkey PRIMARY KEY (id);

ALTER TABLE public.moderacoes_conteudo
  ADD CONSTRAINT moderacoes_conteudo_status_check CHECK (status = ANY (ARRAY['pendente'::text, 'aprovado'::text, 'revisao'::text, 'rejeitado'::text, 'erro'::text]));

ALTER TABLE public.moderacoes_conteudo
  ADD CONSTRAINT moderacoes_conteudo_tipo_conteudo_check CHECK (tipo_conteudo = ANY (ARRAY['avaliacao'::text, 'loja'::text, 'produto'::text]));

GRANT ALL ON public.moderacoes_conteudo TO anon;

GRANT ALL ON public.moderacoes_conteudo TO authenticated;

GRANT ALL ON public.moderacoes_conteudo TO service_role;

CREATE INDEX moderacoes_conteudo_status_idx ON public.moderacoes_conteudo (status, created_at DESC);

CREATE INDEX moderacoes_conteudo_item_idx ON public.moderacoes_conteudo (tipo_conteudo, conteudo_id, created_at DESC);

CREATE TABLE public.notificacoes (
  id         bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  loja_id    bigint,
  titulo     text,
  mensagem   text,
  tipo       text,
  lida       boolean                  DEFAULT false,
  icone      text,
  link       text,
  enviada_em timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notificacoes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notificacoes
  ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);

GRANT ALL ON public.notificacoes TO anon;

GRANT ALL ON public.notificacoes TO authenticated;

GRANT ALL ON public.notificacoes TO service_role;

CREATE POLICY "lojistas podem ver notificacoes das proprias lojas" ON public.notificacoes
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.lojas
  WHERE ((lojas.id = notificacoes.loja_id) AND (lojas.user_id = auth.uid())))));

CREATE TABLE public.pagamentos (
  id                     bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  loja_id                bigint                   NOT NULL,
  plano                  text                     NOT NULL,
  valor                  numeric(10,2)            NOT NULL,
  status                 text                     DEFAULT 'pending'::text NOT NULL,
  mp_payment_id          text,
  mp_preference_id       text,
  created_at             timestamp with time zone DEFAULT now(),
  updated_at             timestamp with time zone DEFAULT now(),
  plano_id               bigint,
  periodo                text,
  meses                  integer,
  novo_vencimento        timestamp with time zone,
  processado_em          timestamp with time zone,
  tipo_mudanca           text,
  plano_anterior         text,
  periodo_anterior       text,
  valor_tabela           numeric(10,2),
  credito_aplicado       numeric(10,2)            DEFAULT 0 NOT NULL,
  dias_restantes_credito integer                  DEFAULT 0 NOT NULL,
  ativacao_em            timestamp with time zone,
  ativado_em             timestamp with time zone
);

COMMENT ON COLUMN public.pagamentos.tipo_mudanca IS 'Contratação, renovação, upgrade ou downgrade.';

COMMENT ON COLUMN public.pagamentos.valor_tabela IS 'Preço original da opção escolhida antes de créditos.';

COMMENT ON COLUMN public.pagamentos.credito_aplicado IS 'Crédito proporcional aplicado em um upgrade.';

COMMENT ON COLUMN public.pagamentos.ativacao_em IS 'Data da ativação imediata ou agendada do plano.';

COMMENT ON COLUMN public.pagamentos.ativado_em IS 'Data em que a mudança de plano foi efetivamente aplicada.';

ALTER TABLE public.pagamentos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_credito_check CHECK (credito_aplicado >= 0::numeric);

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_dias_credito_check CHECK (dias_restantes_credito >= 0);

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_pkey PRIMARY KEY (id);

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_tipo_mudanca_check
    CHECK (tipo_mudanca IS NULL OR (tipo_mudanca = ANY (ARRAY['contratacao'::text, 'renovacao'::text, 'upgrade'::text, 'downgrade'::text])));

GRANT ALL ON public.pagamentos TO anon;

GRANT ALL ON public.pagamentos TO authenticated;

GRANT ALL ON public.pagamentos TO service_role;

CREATE UNIQUE INDEX pagamentos_um_fluxo_aberto_por_loja ON public.pagamentos (loja_id)
  WHERE (status = ANY (ARRAY['pending'::text, 'in_process'::text])) OR status = 'approved'::text AND tipo_mudanca = 'downgrade'::text AND processado_em IS
    NOT NULL AND ativado_em IS NULL;

CREATE INDEX pagamentos_ativacoes_agendadas_idx ON public.pagamentos (ativacao_em)
  WHERE status = 'approved'::text AND tipo_mudanca = 'downgrade'::text AND ativado_em IS NULL;

CREATE POLICY "Permitir inserir pagamentos" ON public.pagamentos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir ler pagamentos" ON public.pagamentos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE public.perfis_lojistas (
  user_id           uuid                     NOT NULL,
  tipo_pessoa       text                     NOT NULL,
  cpf_cnpj          text                     NOT NULL,
  nome_razao_social text                     NOT NULL,
  telefone          text                     NOT NULL,
  criado_em         timestamp with time zone DEFAULT now() NOT NULL,
  atualizado_em     timestamp with time zone DEFAULT now() NOT NULL
);

CREATE POLICY lojista_cadastrado_insere_loja ON public.lojas
  FOR INSERT
  TO authenticated
  WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'em_analise'::text) AND (ativo = false) AND (COALESCE(premium, false) = false) AND (EXISTS ( SELECT 1
   FROM public.perfis_lojistas perfil
  WHERE (perfil.user_id = ( SELECT auth.uid() AS uid)))) AND (( SELECT count(DISTINCT aceite.documento) AS count
   FROM public.aceites_legais aceite
  WHERE
    ((aceite.user_id = ( SELECT auth.uid() AS uid)) AND (aceite.versao = '1.0'::text) AND (aceite.documento = ANY (ARRAY['termos_uso'::text, 'politica_privacidade'::text,
    'termos_lojista'::text])))) = 3)));

ALTER TABLE public.perfis_lojistas
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.perfis_lojistas
  ADD CONSTRAINT cpf_cnpj_formato_valido CHECK (tipo_pessoa = 'pf'::text AND cpf_cnpj ~ '^[0-9]{11}$'::text OR tipo_pessoa = 'pj'::text AND cpf_cnpj ~ '^[0-9]{14}$'::text);

ALTER TABLE public.perfis_lojistas
  ADD CONSTRAINT perfis_lojistas_cpf_cnpj_key UNIQUE (cpf_cnpj);

ALTER TABLE public.perfis_lojistas
  ADD CONSTRAINT perfis_lojistas_pkey PRIMARY KEY (user_id);

ALTER TABLE public.perfis_lojistas
  ADD CONSTRAINT perfis_lojistas_tipo_pessoa_check CHECK (tipo_pessoa = ANY (ARRAY['pf'::text, 'pj'::text]));

ALTER TABLE public.perfis_lojistas
  ADD CONSTRAINT perfis_lojistas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.perfis_lojistas
  ADD CONSTRAINT telefone_formato_valido CHECK (telefone ~ '^[0-9]{10,13}$'::text);

GRANT ALL ON public.perfis_lojistas TO authenticated;

GRANT ALL ON public.perfis_lojistas TO service_role;

CREATE POLICY "Lojista atualiza seu perfil" ON public.perfis_lojistas
  FOR UPDATE
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Lojista cria seu perfil" ON public.perfis_lojistas
  FOR INSERT
  TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Lojista visualiza seu perfil" ON public.perfis_lojistas
  FOR SELECT
  TO authenticated
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE TABLE public.planos_catalogo (
  id                     bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  codigo                 text                     NOT NULL,
  nome                   text                     NOT NULL,
  periodo                text                     NOT NULL,
  meses                  integer                  NOT NULL,
  preco                  numeric(12,2)            NOT NULL,
  limite_lojas           integer                  DEFAULT 1 NOT NULL,
  limite_produtos        integer                  DEFAULT 5 NOT NULL,
  limite_imagens_produto integer                  DEFAULT 1 NOT NULL,
  permite_promocao       boolean                  DEFAULT false NOT NULL,
  permite_destaque       boolean                  DEFAULT false NOT NULL,
  prioridade_busca       integer                  DEFAULT 0 NOT NULL,
  estatisticas_nivel     text                     DEFAULT 'basico'::text NOT NULL,
  ativo                  boolean                  DEFAULT true NOT NULL,
  created_at             timestamp with time zone DEFAULT now() NOT NULL,
  updated_at             timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.planos_catalogo
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.planos_catalogo
  ADD CONSTRAINT planos_catalogo_codigo_periodo_unico UNIQUE (codigo, periodo);

ALTER TABLE public.planos_catalogo
  ADD CONSTRAINT planos_catalogo_estatisticas_validas CHECK (estatisticas_nivel = ANY (ARRAY['basico'::text, 'completo'::text, 'avancado'::text, 'multiunidade'::text]));

ALTER TABLE public.planos_catalogo
  ADD CONSTRAINT planos_catalogo_periodo_valido CHECK (periodo = ANY (ARRAY['mensal'::text, 'trimestral'::text, 'anual'::text]));

ALTER TABLE public.planos_catalogo
  ADD CONSTRAINT planos_catalogo_pkey PRIMARY KEY (id);

ALTER TABLE public.ativacoes_manuais_planos
  ADD CONSTRAINT ativacoes_manuais_planos_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos_catalogo(id) ON DELETE RESTRICT;

ALTER TABLE public.pagamentos
  ADD CONSTRAINT pagamentos_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos_catalogo(id);

GRANT ALL ON public.planos_catalogo TO anon;

GRANT ALL ON public.planos_catalogo TO authenticated;

GRANT ALL ON public.planos_catalogo TO service_role;

CREATE INDEX planos_catalogo_codigo_idx ON public.planos_catalogo (codigo);

CREATE POLICY "Enable read access for all users" ON public.planos_catalogo
  FOR SELECT
  USING (true);

CREATE TABLE public.produto_imagens (
  id         bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  produto_id bigint                   NOT NULL,
  imagem_url text                     NOT NULL,
  ordem      integer                  DEFAULT 0 NOT NULL,
  principal  boolean                  DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.produto_imagens
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.produto_imagens
  ADD CONSTRAINT produto_imagens_pkey PRIMARY KEY (id);

GRANT ALL ON public.produto_imagens TO anon;

GRANT ALL ON public.produto_imagens TO authenticated;

GRANT ALL ON public.produto_imagens TO service_role;

CREATE INDEX produto_imagens_ordem_idx ON public.produto_imagens (produto_id, ordem);

CREATE INDEX produto_imagens_produto_id_idx ON public.produto_imagens (produto_id);

CREATE POLICY "Imagens publicas podem ser vistas" ON public.produto_imagens
  FOR SELECT
  USING (true);

CREATE TABLE public.produtos (
  id                     bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  created_at             timestamp with time zone DEFAULT now() NOT NULL,
  nome                   text,
  descricao              text,
  preco                  numeric,
  imagem_url             text,
  loja_id                bigint,
  user_id                uuid,
  ativo                  boolean                  DEFAULT true,
  destaque               boolean                  DEFAULT false,
  status                 text                     DEFAULT 'em_analise'::text,
  preco_promocional      numeric(12,2),
  categoria              text,
  estoque                integer                  DEFAULT 0,
  disponivel             boolean                  DEFAULT true,
  promocao               boolean                  DEFAULT false,
  visualizacoes          integer                  DEFAULT 0,
  cliques_whatsapp       integer                  DEFAULT 0,
  marca                  text,
  slug                   text,
  updated_at             timestamp with time zone DEFAULT now(),
  moderacao_status       text                     DEFAULT 'pendente'::text NOT NULL,
  moderacao_motivo       text,
  moderacao_categorias   jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  moderacao_score_maximo double precision,
  moderacao_modelo       text,
  moderacao_tentativas   integer                  DEFAULT 0 NOT NULL,
  moderacao_erro         text,
  moderado_em            timestamp with time zone
);

CREATE POLICY "Lojista pode atualizar imagens" ON public.produto_imagens
  FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM public.produtos
  WHERE ((produtos.id = produto_imagens.produto_id) AND (produtos.user_id = auth.uid())))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.produtos
  WHERE ((produtos.id = produto_imagens.produto_id) AND (produtos.user_id = auth.uid())))));

CREATE POLICY "Lojista pode criar imagens" ON public.produto_imagens
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.produtos
  WHERE ((produtos.id = produto_imagens.produto_id) AND (produtos.user_id = auth.uid())))));

CREATE POLICY "Lojista pode excluir imagens" ON public.produto_imagens
  FOR DELETE
  USING ((EXISTS ( SELECT 1
   FROM public.produtos
  WHERE ((produtos.id = produto_imagens.produto_id) AND (produtos.user_id = auth.uid())))));

ALTER TABLE public.produtos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.produtos
  ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);

ALTER TABLE public.favoritos
  ADD CONSTRAINT favoritos_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;

ALTER TABLE public.produto_imagens
  ADD CONSTRAINT produto_imagens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE;

GRANT ALL ON public.produtos TO anon;

GRANT ALL ON public.produtos TO authenticated;

GRANT ALL ON public.produtos TO service_role;

CREATE INDEX produtos_categoria_idx ON public.produtos (categoria);

CREATE INDEX produtos_nome_idx ON public.produtos USING gin (to_tsvector('portuguese'::regconfig, COALESCE(nome, ''::text)));

CREATE UNIQUE INDEX produtos_slug_unico_idx ON public.produtos (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX produtos_promocao_idx ON public.produtos (promocao);

CREATE INDEX produtos_loja_id_idx ON public.produtos (loja_id);

CREATE INDEX produtos_ativo_idx ON public.produtos (ativo);

CREATE POLICY "Enable insert for authenticated users only" ON public.produtos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.produtos
  FOR SELECT
  USING (true);

CREATE POLICY delete_own_products ON public.produtos
  FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY update_own_products ON public.produtos
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE TABLE public.solicitacoes_planos (
  id               bigint                   DEFAULT nextval('public.solicitacoes_planos_id_seq'::regclass) NOT NULL,
  created_at       timestamp with time zone DEFAULT now(),
  user_id          uuid,
  email            text,
  plano_solicitado text,
  status           text                     DEFAULT 'pendente'::text,
  observacao       text
);

ALTER SEQUENCE public.solicitacoes_planos_id_seq OWNED BY public.solicitacoes_planos.id;

GRANT ALL ON SEQUENCE public.solicitacoes_planos_id_seq TO anon;

GRANT ALL ON SEQUENCE public.solicitacoes_planos_id_seq TO authenticated;

GRANT ALL ON SEQUENCE public.solicitacoes_planos_id_seq TO service_role;

ALTER TABLE public.solicitacoes_planos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.solicitacoes_planos
  ADD CONSTRAINT solicitacoes_planos_pkey PRIMARY KEY (id);

GRANT ALL ON public.solicitacoes_planos TO anon;

GRANT ALL ON public.solicitacoes_planos TO authenticated;

GRANT ALL ON public.solicitacoes_planos TO service_role;

CREATE POLICY "Admin pode atualizar solicitacoes" ON public.solicitacoes_planos
  FOR UPDATE
  TO authenticated
  USING (((auth.jwt() ->> 'email'::text) = 'vemverapp@gmail.com'::text))
  WITH CHECK (((auth.jwt() ->> 'email'::text) = 'vemverapp@gmail.com'::text));

CREATE POLICY "Admin pode ver todas solicitacoes" ON public.solicitacoes_planos
  FOR SELECT
  TO authenticated
  USING (((auth.jwt() ->> 'email'::text) = 'vemverapp@gmail.com'::text));

CREATE POLICY "Usuarios podem criar solicitacoes" ON public.solicitacoes_planos
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Usuarios podem ver suas solicitacoes" ON public.solicitacoes_planos
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE TABLE public.users (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  name       text,
  email      text,
  phone      text,
  city       text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.users
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users
  ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE public.users
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE public.ads
  ADD CONSTRAINT ads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

GRANT ALL ON public.users TO anon;

GRANT ALL ON public.users TO authenticated;

GRANT ALL ON public.users TO service_role;
