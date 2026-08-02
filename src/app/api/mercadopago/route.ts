import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://bwyqesogduegtoookdhu.supabase.co";

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://vemverapp.com.br"
).replace(/\/+$/, "");

type PeriodoPlano = "mensal" | "trimestral" | "anual";

type TipoMudanca = "contratacao" | "renovacao" | "upgrade" | "downgrade";

type PlanoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  periodo: PeriodoPlano;
  meses: number;
  preco: number;
  ativo: boolean;
};

type PlanoAtualCatalogo = {
  codigo: string;
  periodo: PeriodoPlano;
  meses: number;
  preco: number;
};

const hierarquiaPlanos: Record<string, number> = {
  gratis: 0,
  premium: 1,
  patrocinado: 2,
  multiunidade: 3,
  franquia: 4,
};

function normalizarTexto(valor: unknown) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function periodoValido(valor: string): valor is PeriodoPlano {
  return valor === "mensal" || valor === "trimestral" || valor === "anual";
}

function arredondarMoeda(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function dataValida(valor: unknown) {
  if (!valor) return null;

  const data = new Date(String(valor));

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

function adicionarMeses(dataBase: Date, quantidadeMeses: number) {
  const resultado = new Date(dataBase);
  const diaOriginal = resultado.getUTCDate();

  resultado.setUTCDate(1);
  resultado.setUTCMonth(resultado.getUTCMonth() + quantidadeMeses);

  const ultimoDiaDoMes = new Date(
    Date.UTC(resultado.getUTCFullYear(), resultado.getUTCMonth() + 1, 0),
  ).getUTCDate();

  resultado.setUTCDate(Math.min(diaOriginal, ultimoDiaDoMes));

  return resultado;
}

function formatarPeriodo(periodo: PeriodoPlano) {
  const nomes: Record<PeriodoPlano, string> = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual",
  };

  return nomes[periodo];
}

function formatarTipoMudanca(tipoMudanca: TipoMudanca) {
  const nomes: Record<TipoMudanca, string> = {
    contratacao: "Nova contratação",
    renovacao: "Renovação",
    upgrade: "Upgrade",
    downgrade: "Mudança agendada",
  };

  return nomes[tipoMudanca];
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: "Configuração do Supabase incompleta",
        },
        { status: 500 },
      );
    }

    const authorization = request.headers.get("authorization") || "";

    const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Faça login para contratar um plano",
        },
        { status: 401 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Sessão inválida ou expirada",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const lojaId = Number(body?.loja_id);
    const planoId = Number(body?.plano_id);
    const apenasSimular = body?.modo === "simulacao";

    if (
      !Number.isInteger(lojaId) ||
      lojaId <= 0 ||
      !Number.isInteger(planoId) ||
      planoId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Loja ou opção de plano inválida",
        },
        { status: 400 },
      );
    }

    const { data: planoData, error: planoError } = await supabaseAdmin
      .from("planos_catalogo")
      .select(
        `
          id,
          codigo,
          nome,
          periodo,
          meses,
          preco,
          ativo
        `,
      )
      .eq("id", planoId)
      .eq("ativo", true)
      .maybeSingle();

    if (planoError) {
      console.error("Erro ao consultar o catálogo:", planoError);

      return NextResponse.json(
        {
          error: "Erro ao consultar o plano",
        },
        { status: 500 },
      );
    }

    if (!planoData) {
      return NextResponse.json(
        {
          error: "Opção de plano indisponível",
        },
        { status: 404 },
      );
    }

    const plano = planoData as PlanoCatalogo;

    const planoNovo = normalizarTexto(plano.codigo);

    const periodoNovo = normalizarTexto(plano.periodo);

    const codigosPermitidos = ["premium", "patrocinado", "multiunidade"];

    const precoTabela = arredondarMoeda(Number(plano.preco));

    const meses = Number(plano.meses);

    if (
      !codigosPermitidos.includes(planoNovo) ||
      !periodoValido(periodoNovo) ||
      !Number.isInteger(meses) ||
      meses <= 0 ||
      !Number.isFinite(precoTabela) ||
      precoTabela <= 0
    ) {
      return NextResponse.json(
        {
          error: "Configuração inválida no catálogo de planos",
        },
        { status: 500 },
      );
    }

    const { data: loja, error: lojaError } = await supabaseAdmin
      .from("lojas")
      .select(
        `
          id,
          nome,
          user_id,
          plano,
          plano_periodo,
          plano_inicio,
          plano_vencimento,
          assinatura_status
        `,
      )
      .eq("id", lojaId)
      .maybeSingle();

    if (lojaError) {
      console.error("Erro ao consultar a loja:", lojaError);

      return NextResponse.json(
        {
          error: "Erro ao consultar a loja",
        },
        { status: 500 },
      );
    }

    if (!loja) {
      return NextResponse.json(
        {
          error: "Loja não encontrada",
        },
        { status: 404 },
      );
    }

    if (String(loja.user_id || "") !== user.id) {
      return NextResponse.json(
        {
          error: "Você não tem permissão para alterar esta loja",
        },
        { status: 403 },
      );
    }

    const agora = new Date();
    const vencimentoAtual = dataValida(loja.plano_vencimento);

    const planoAnterior = normalizarTexto(loja.plano || "gratis") || "gratis";

    const periodoAnterior = normalizarTexto(loja.plano_periodo);

    const assinaturaAtiva = normalizarTexto(loja.assinatura_status) === "ativa";

    const planoAtualVigente =
      assinaturaAtiva &&
      vencimentoAtual !== null &&
      vencimentoAtual.getTime() > agora.getTime() &&
      planoAnterior !== "gratis";

    let tipoMudanca: TipoMudanca;

    if (!planoAtualVigente) {
      tipoMudanca = "contratacao";
    } else if (planoAnterior === planoNovo) {
      tipoMudanca = "renovacao";
    } else {
      const nivelAnterior = hierarquiaPlanos[planoAnterior] ?? 0;

      const nivelNovo = hierarquiaPlanos[planoNovo] ?? 0;

      tipoMudanca = nivelNovo > nivelAnterior ? "upgrade" : "downgrade";
    }

    let creditoAplicado = 0;
    let diasRestantesCredito = 0;

    if (tipoMudanca === "upgrade" && vencimentoAtual) {
      let planoAtualQuery = supabaseAdmin
        .from("planos_catalogo")
        .select(
          `
              codigo,
              periodo,
              meses,
              preco
            `,
        )
        .eq("codigo", planoAnterior)
        .eq("ativo", true);

      if (periodoValido(periodoAnterior)) {
        planoAtualQuery = planoAtualQuery.eq("periodo", periodoAnterior);
      }

      const { data: planoAtualData, error: planoAtualError } =
        await planoAtualQuery
          .order("meses", {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

      if (planoAtualError) {
        console.error("Erro ao consultar o plano atual:", planoAtualError);

        return NextResponse.json(
          {
            error: "Erro ao calcular o crédito do plano atual",
          },
          { status: 500 },
        );
      }

      if (planoAtualData) {
        const planoAtual = planoAtualData as PlanoAtualCatalogo;

        const valorPlanoAtual = Number(planoAtual.preco);

        const inicioRegistrado = dataValida(loja.plano_inicio);

        const inicioDoCiclo =
          inicioRegistrado &&
          inicioRegistrado.getTime() < vencimentoAtual.getTime()
            ? inicioRegistrado
            : adicionarMeses(vencimentoAtual, -Number(planoAtual.meses || 1));

        const duracaoTotal =
          vencimentoAtual.getTime() - inicioDoCiclo.getTime();

        const tempoRestante = Math.max(
          0,
          vencimentoAtual.getTime() - agora.getTime(),
        );

        if (
          Number.isFinite(valorPlanoAtual) &&
          valorPlanoAtual > 0 &&
          duracaoTotal > 0 &&
          tempoRestante > 0
        ) {
          creditoAplicado = arredondarMoeda(
            valorPlanoAtual * (tempoRestante / duracaoTotal),
          );

          diasRestantesCredito = Math.ceil(
            tempoRestante / (24 * 60 * 60 * 1000),
          );
        }
      }
    }

    const valorCobrado = arredondarMoeda(precoTabela - creditoAplicado);

    if (tipoMudanca === "upgrade" && valorCobrado < 1) {
      return NextResponse.json(
        {
          error: "O crédito do seu plano atual cobre esta opção.",
          detalhes:
            "Escolha um período maior do novo plano para utilizar o crédito sem perder valor.",
          tipo_mudanca: tipoMudanca,
          valor_tabela: precoTabela,
          credito_aplicado: creditoAplicado,
          valor_final: valorCobrado,
        },
        { status: 409 },
      );
    }

    let ativacaoEm = agora;
    let novoVencimento = adicionarMeses(agora, meses);

    if (
      (tipoMudanca === "renovacao" || tipoMudanca === "downgrade") &&
      vencimentoAtual
    ) {
      ativacaoEm = vencimentoAtual;

      novoVencimento = adicionarMeses(vencimentoAtual, meses);
    }

    const resumoMudanca = {
      simulacao: apenasSimular,
      tipo_mudanca: tipoMudanca,
      tipo_mudanca_nome: formatarTipoMudanca(tipoMudanca),
      plano_anterior: planoAnterior,
      periodo_anterior: periodoAnterior || null,
      plano_novo: planoNovo,
      periodo_novo: periodoNovo,
      meses,
      valor_tabela: precoTabela,
      credito_aplicado: creditoAplicado,
      dias_restantes_credito: diasRestantesCredito,
      valor_final: valorCobrado,
      ativacao_em: ativacaoEm.toISOString(),
      novo_vencimento: novoVencimento.toISOString(),
    };

    if (apenasSimular) {
      return NextResponse.json(resumoMudanca);
    }

    if (!mercadoPagoToken) {
      return NextResponse.json(
        {
          error: "Credencial do Mercado Pago não configurada",
        },
        { status: 500 },
      );
    }

    const trintaMinutosAtras = new Date(
      agora.getTime() - 30 * 60 * 1000,
    ).toISOString();

    const cincoMinutosAtras = new Date(
      agora.getTime() - 5 * 60 * 1000,
    ).toISOString();

    const expiracaoPreferencia = new Date(agora.getTime() + 30 * 60 * 1000);

    /*
     * Preferências que não foram pagas em
     * 30 minutos deixam de bloquear a loja.
     * Pagamentos em processamento não são
     * cancelados automaticamente.
     */
    const { error: expiracaoError } = await supabaseAdmin
      .from("pagamentos")
      .update({
        status: "cancelled",
        updated_at: agora.toISOString(),
      })
      .eq("loja_id", lojaId)
      .eq("status", "pending")
      .lt("created_at", trintaMinutosAtras);

    if (expiracaoError) {
      console.error("Erro ao encerrar pagamentos expirados:", expiracaoError);

      return NextResponse.json(
        {
          error: "Erro ao verificar cobranças anteriores",
        },
        { status: 500 },
      );
    }

    /*
     * Um downgrade já pago precisa ser
     * ativado ou cancelado com atendimento
     * antes de outra compra ser permitida.
     */
    const { data: mudancaAgendada, error: agendamentoError } =
      await supabaseAdmin
        .from("pagamentos")
        .select(
          `
          id,
          plano,
          periodo,
          ativacao_em
        `,
        )
        .eq("loja_id", lojaId)
        .eq("status", "approved")
        .eq("tipo_mudanca", "downgrade")
        .not("processado_em", "is", null)
        .is("ativado_em", null)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (agendamentoError) {
      console.error("Erro ao verificar mudança agendada:", agendamentoError);

      return NextResponse.json(
        {
          error: "Erro ao verificar mudanças de plano",
        },
        { status: 500 },
      );
    }

    if (mudancaAgendada) {
      return NextResponse.json(
        {
          error:
            "Já existe uma mudança de plano paga e agendada para esta loja.",
          detalhes:
            "Aguarde a data de ativação ou entre em contato com o atendimento antes de contratar outra opção.",
          codigo: "MUDANCA_AGENDADA_EXISTENTE",
          mudanca_agendada: mudancaAgendada,
        },
        { status: 409 },
      );
    }

    /*
     * Evita duas compras aprovadas em poucos
     * segundos por abas ou cliques diferentes.
     */
    const { data: pagamentoAprovadoRecente, error: aprovadoRecenteError } =
      await supabaseAdmin
        .from("pagamentos")
        .select("id, plano, periodo, created_at")
        .eq("loja_id", lojaId)
        .eq("status", "approved")
        .not("processado_em", "is", null)
        .gte("created_at", cincoMinutosAtras)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (aprovadoRecenteError) {
      console.error(
        "Erro ao verificar pagamento aprovado recente:",
        aprovadoRecenteError,
      );

      return NextResponse.json(
        {
          error: "Erro ao verificar o último pagamento",
        },
        { status: 500 },
      );
    }

    if (pagamentoAprovadoRecente) {
      return NextResponse.json(
        {
          error: "Um pagamento desta loja foi aprovado recentemente.",
          detalhes:
            "Aguarde 5 minutos e atualize a página antes de iniciar outra compra.",
          codigo: "PAGAMENTO_APROVADO_RECENTE",
        },
        { status: 409 },
      );
    }

    const { data: pagamentoPendente, error: pendenteError } =
      await supabaseAdmin
        .from("pagamentos")
        .select(
          `
          id,
          plano,
          periodo,
          status,
          mp_preference_id,
          created_at
        `,
        )
        .eq("loja_id", lojaId)
        .in("status", ["pending", "in_process"])
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (pendenteError) {
      console.error("Erro ao verificar pagamentos pendentes:", pendenteError);

      return NextResponse.json(
        {
          error: "Erro ao verificar pagamentos pendentes",
        },
        { status: 500 },
      );
    }

    if (pagamentoPendente) {
      return NextResponse.json(
        {
          error: "Já existe um pagamento aguardando conclusão para esta loja.",
          detalhes:
            "Conclua a cobrança que já foi aberta ou aguarde até 30 minutos para ela expirar.",
          codigo: "PAGAMENTO_ABERTO_EXISTENTE",
          pagamento_aberto: pagamentoPendente,
        },
        { status: 409 },
      );
    }

    /*
     * A linha é reservada antes de chamar o
     * Mercado Pago. Com o índice único no
     * banco, duas requisições simultâneas não
     * conseguem criar duas cobranças abertas.
     */
    const { data: pagamentoCriado, error: reservaError } = await supabaseAdmin
      .from("pagamentos")
      .insert({
        loja_id: lojaId,
        plano: planoNovo,
        plano_id: plano.id,
        periodo: periodoNovo,
        meses,
        valor: valorCobrado,
        valor_tabela: precoTabela,
        credito_aplicado: creditoAplicado,
        dias_restantes_credito: diasRestantesCredito,
        tipo_mudanca: tipoMudanca,
        plano_anterior: planoAnterior,
        periodo_anterior: periodoAnterior || null,
        ativacao_em: ativacaoEm.toISOString(),
        novo_vencimento: novoVencimento.toISOString(),
        ativado_em: null,
        status: "pending",
        mp_preference_id: null,
        processado_em: null,
      })
      .select("id")
      .single();

    if (reservaError || !pagamentoCriado) {
      if (reservaError?.code === "23505") {
        return NextResponse.json(
          {
            error: "Já existe uma cobrança sendo criada para esta loja.",
            detalhes: "Aguarde alguns segundos e atualize a página.",
            codigo: "COBRANCA_SIMULTANEA_BLOQUEADA",
          },
          { status: 409 },
        );
      }

      console.error("Erro ao reservar pagamento:", reservaError);

      return NextResponse.json(
        {
          error: "Erro ao iniciar o pagamento",
          detalhes: reservaError?.message,
        },
        { status: 500 },
      );
    }

    const mpClient = new MercadoPagoConfig({
      accessToken: mercadoPagoToken,
    });

    const preference = new Preference(mpClient);

    let response: any;

    try {
      response = await preference.create({
        body: {
          items: [
            {
              id: String(plano.id),
              title:
                `Plano ${plano.nome} VemVer - ` + formatarPeriodo(periodoNovo),
              quantity: 1,
              unit_price: valorCobrado,
              currency_id: "BRL",
            },
          ],

          payer: {
            email: user.email || undefined,
          },

          external_reference: String(lojaId),

          metadata: {
            pagamento_id: pagamentoCriado.id,
            loja_id: lojaId,
            plano_id: plano.id,
            plano: planoNovo,
            periodo: periodoNovo,
            meses,
            tipo_mudanca: tipoMudanca,
          },

          notification_url: `${siteUrl}/api/webhook/mercadopago`,

          back_urls: {
            success: `${siteUrl}/lojista/loja/${lojaId}?pagamento=sucesso`,
            failure: `${siteUrl}/lojista/loja/${lojaId}?pagamento=falha`,
            pending: `${siteUrl}/lojista/loja/${lojaId}?pagamento=pendente`,
          },

          auto_return: "approved",

          expires: true,
          expiration_date_from: agora.toISOString(),
          expiration_date_to: expiracaoPreferencia.toISOString(),
        },
      });
    } catch (preferenceError) {
      await supabaseAdmin
        .from("pagamentos")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", pagamentoCriado.id);

      throw preferenceError;
    }

    if (!response.id) {
      await supabaseAdmin
        .from("pagamentos")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", pagamentoCriado.id);

      return NextResponse.json(
        {
          error: "O Mercado Pago não retornou a identificação da cobrança",
        },
        { status: 502 },
      );
    }

    const { data: pagamentoAtualizado, error: pagamentoError } =
      await supabaseAdmin
        .from("pagamentos")
        .update({
          mp_preference_id: response.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pagamentoCriado.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

    if (pagamentoError || !pagamentoAtualizado) {
      console.error("Erro ao registrar pagamento:", pagamentoError);

      await supabaseAdmin
        .from("pagamentos")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", pagamentoCriado.id);

      return NextResponse.json(
        {
          error: "Erro ao registrar pagamento",
          detalhes:
            pagamentoError?.message ||
            "A reserva da cobrança não foi localizada.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ...resumoMudanca,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      id: response.id,
      pagamento_id: pagamentoCriado.id,
    });
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error?.message || error);

    return NextResponse.json(
      {
        error: "Erro ao criar pagamento",
        detalhes: error?.message || "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}