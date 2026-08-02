import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://bwyqesogduegtoookdhu.supabase.co";

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const ADMIN_EMAIL = "vemverapp@gmail.com";

type TipoAtivacao = "imediata" | "agendada";

type PlanoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  periodo: "mensal" | "trimestral" | "anual";
  meses: number;
  preco: number;
  limite_lojas: number | null;
  ativo: boolean;
};

type LojaAtual = {
  id: number;
  nome: string;
  user_id: string | null;
  plano: string | null;
  premium: boolean | null;
  patrocinado: boolean | null;
  limite_lojas: number | null;
  plano_periodo: string | null;
  plano_inicio: string | null;
  plano_vencimento: string | null;
  assinatura_status: string | null;
  renovacao_automatica: boolean | null;
  cortesia_ate: string | null;
  aviso_7_dias: boolean | null;
  aviso_3_dias: boolean | null;
  aviso_1_dia: boolean | null;
  aviso_vencido: boolean | null;
};

function normalizarTexto(valor: unknown) {
  return String(valor || "")
    .trim()
    .toLowerCase();
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

function formatarData(data: Date) {
  return data.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

function nomePeriodo(periodo: string) {
  if (periodo === "anual") return "Anual";
  if (periodo === "trimestral") return "Trimestral";

  return "Mensal";
}

function respostaErro(error: string, status: number, detalhes?: string) {
  return NextResponse.json(
    {
      sucesso: false,
      error,
      ...(detalhes ? { detalhes } : {}),
    },
    { status },
  );
}

export async function POST(request: Request) {
 let supabaseAdmin: any = null;
  let ativacaoManualId: number | null = null;

  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return respostaErro("Configuração administrativa incompleta", 500);
    }

    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();

    if (!accessToken) {
      return respostaErro("Faça login novamente", 401);
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
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
      return respostaErro("Sessão inválida ou expirada", 401);
    }

    const adminEmail = normalizarTexto(user.email);

    if (adminEmail !== ADMIN_EMAIL) {
      return respostaErro(
        "Você não possui permissão para realizar esta operação",
        403,
      );
    }

    const body = await request.json();

    const lojaId = Number(body?.loja_id);
    const planoId = Number(body?.plano_id);
    const tipoAtivacao = normalizarTexto(body?.tipo_ativacao) as TipoAtivacao;
    const motivo = String(body?.motivo || "").trim();

    if (!Number.isInteger(lojaId) || lojaId <= 0) {
      return respostaErro("Loja inválida", 400);
    }

    if (!Number.isInteger(planoId) || planoId <= 0) {
      return respostaErro("Opção de plano inválida", 400);
    }

    if (!["imediata", "agendada"].includes(tipoAtivacao)) {
      return respostaErro("Tipo de ativação inválido", 400);
    }

    if (motivo.length < 5 || motivo.length > 500) {
      return respostaErro("Informe um motivo entre 5 e 500 caracteres", 400);
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
          limite_lojas,
          ativo
        `,
      )
      .eq("id", planoId)
      .eq("ativo", true)
      .maybeSingle();

    if (planoError) {
      console.error("Erro ao consultar o plano:", planoError);

      return respostaErro(
        "Erro ao consultar o catálogo de planos",
        500,
        planoError.message,
      );
    }

    if (!planoData) {
      return respostaErro("Opção de plano indisponível", 404);
    }

    const plano = planoData as PlanoCatalogo;
    const planoCodigo = normalizarTexto(plano.codigo);
    const periodo = normalizarTexto(plano.periodo);
    const meses = Number(plano.meses);

    const codigosPermitidos = ["premium", "patrocinado", "multiunidade"];

    const periodosPermitidos = ["mensal", "trimestral", "anual"];

    if (
      !codigosPermitidos.includes(planoCodigo) ||
      !periodosPermitidos.includes(periodo) ||
      !Number.isInteger(meses) ||
      meses <= 0
    ) {
      return respostaErro("Configuração inválida no catálogo de planos", 500);
    }

    const { data: lojaData, error: lojaError } = await supabaseAdmin
      .from("lojas")
      .select(
        `
          id,
          nome,
          user_id,
          plano,
          premium,
          patrocinado,
          limite_lojas,
          plano_periodo,
          plano_inicio,
          plano_vencimento,
          assinatura_status,
          renovacao_automatica,
          cortesia_ate,
          aviso_7_dias,
          aviso_3_dias,
          aviso_1_dia,
          aviso_vencido
        `,
      )
      .eq("id", lojaId)
      .maybeSingle();

    if (lojaError) {
      console.error("Erro ao consultar a loja:", lojaError);

      return respostaErro("Erro ao consultar a loja", 500, lojaError.message);
    }

    if (!lojaData) {
      return respostaErro("Loja não encontrada", 404);
    }

    const loja = lojaData as LojaAtual;

    const { data: pagamentosPossiveis, error: pagamentosError } =
      await supabaseAdmin
        .from("pagamentos")
        .select(
          `
          id,
          status,
          tipo_mudanca,
          processado_em,
          ativado_em
        `,
        )
        .eq("loja_id", lojaId)
        .in("status", ["pending", "in_process", "approved"])
        .order("created_at", { ascending: false });

    if (pagamentosError) {
      console.error("Erro ao verificar pagamentos da loja:", pagamentosError);

      return respostaErro(
        "Erro ao verificar cobranças existentes",
        500,
        pagamentosError.message,
      );
    }

    const pagamentoConflitante = (pagamentosPossiveis || []).find(
      (pagamento: any) => {
        const status = normalizarTexto(pagamento.status);
        const tipoMudanca = normalizarTexto(pagamento.tipo_mudanca);

        const pagamentoAberto = ["pending", "in_process"].includes(status);

        const mudancaPagaAgendada =
          status === "approved" &&
          tipoMudanca === "downgrade" &&
          Boolean(pagamento.processado_em) &&
          !pagamento.ativado_em;

        return pagamentoAberto || mudancaPagaAgendada;
      },
    );

    if (pagamentoConflitante) {
      return respostaErro(
        "Esta loja possui uma cobrança aberta ou uma mudança paga aguardando ativação. Resolva essa operação antes de realizar uma ativação administrativa.",
        409,
      );
    }

    const { data: ativacaoExistente, error: ativacaoExistenteError } =
      await supabaseAdmin
        .from("ativacoes_manuais_planos")
        .select("id, ativacao_em")
        .eq("loja_id", lojaId)
        .eq("status", "agendada")
        .maybeSingle();

    if (ativacaoExistenteError) {
      console.error(
        "Erro ao verificar ativações administrativas:",
        ativacaoExistenteError,
      );

      return respostaErro(
        "Erro ao verificar ativações administrativas",
        500,
        ativacaoExistenteError.message,
      );
    }

    if (ativacaoExistente) {
      return respostaErro(
        "Esta loja já possui uma ativação administrativa agendada",
        409,
      );
    }

    const agora = new Date();
    let ativacaoEm = new Date(agora);

    if (tipoAtivacao === "agendada") {
      ativacaoEm = new Date(String(body?.ativacao_em || ""));

      if (Number.isNaN(ativacaoEm.getTime())) {
        return respostaErro("Data de ativação inválida", 400);
      }

      if (ativacaoEm.getTime() <= agora.getTime() + 60_000) {
        return respostaErro(
          "A ativação agendada precisa estar pelo menos 1 minuto no futuro",
          400,
        );
      }
    }

    const novoVencimento = adicionarMeses(ativacaoEm, meses);
    const planoAnterior = normalizarTexto(loja.plano || "gratis") || "gratis";
    const periodoAnterior = normalizarTexto(loja.plano_periodo) || null;

    const { data: ativacaoCriada, error: criarAtivacaoError } =
      await supabaseAdmin
        .from("ativacoes_manuais_planos")
        .insert({
          loja_id: lojaId,
          plano_id: plano.id,
          plano_codigo: planoCodigo,
          periodo,
          meses,
          tipo_ativacao: tipoAtivacao,
          status: "agendada",
          ativacao_em: ativacaoEm.toISOString(),
          novo_vencimento: novoVencimento.toISOString(),
          plano_anterior: planoAnterior,
          periodo_anterior: periodoAnterior,
          motivo,
          admin_user_id: user.id,
          admin_email: adminEmail,
        })
        .select("id")
        .single();

    if (criarAtivacaoError) {
      if (criarAtivacaoError.code === "23505") {
        return respostaErro(
          "Outra ativação administrativa já está sendo processada para esta loja",
          409,
        );
      }

      console.error(
        "Erro ao registrar ativação administrativa:",
        criarAtivacaoError,
      );

      return respostaErro(
        "Erro ao registrar a ativação administrativa",
        500,
        criarAtivacaoError.message,
      );
    }

    ativacaoManualId = Number(ativacaoCriada.id);
    const referencia = `admin-ativacao-${ativacaoManualId}`;
    const avisos: string[] = [];

    if (tipoAtivacao === "agendada") {
      const mensagem =
        `O administrador agendou o plano ${planoCodigo} ` +
        `${nomePeriodo(periodo)} para a loja ${loja.nome}. ` +
        `A ativação ocorrerá em ${formatarData(ativacaoEm)} e o plano ` +
        `ficará válido até ${formatarData(novoVencimento)}. ` +
        `Motivo: ${motivo}`;

      const resultadosAuxiliares = await Promise.allSettled([
        supabaseAdmin
          .from("historico_assinaturas")
          .insert({
            loja_id: lojaId,
            evento: "ativacao_manual_agendada",
            plano_anterior: planoAnterior,
            plano_novo: planoCodigo,
            mensagem,
            usuario_id: user.id,
            referencia,
          })
          .throwOnError(),

        supabaseAdmin
          .from("notificacoes")
          .insert({
            loja_id: lojaId,
            titulo: "Ativação de plano agendada pelo administrador",
            mensagem,
            tipo: "assinatura",
            lida: false,
            icone: "calendar",
            link: `/lojista/loja/${lojaId}`,
            enviada_em: new Date().toISOString(),
          })
          .throwOnError(),
      ]);

      resultadosAuxiliares.forEach((resultado, indice) => {
        if (resultado.status === "rejected") {
          const aviso =
            indice === 0
              ? "Não foi possível registrar o histórico auxiliar"
              : "Não foi possível criar a notificação auxiliar";

          avisos.push(aviso);
          console.error(aviso, resultado.reason);
        }
      });

      return NextResponse.json(
        {
          sucesso: true,
          mensagem: "Ativação administrativa agendada com sucesso",
          ativacao: {
            id: ativacaoManualId,
            loja_id: lojaId,
            plano: planoCodigo,
            periodo,
            tipo_ativacao: tipoAtivacao,
            status: "agendada",
            ativacao_em: ativacaoEm.toISOString(),
            novo_vencimento: novoVencimento.toISOString(),
          },
          avisos,
        },
        { status: 201 },
      );
    }

    const { error: atualizarLojaError } = await supabaseAdmin
      .from("lojas")
      .update({
        plano: planoCodigo,
        premium: true,
        patrocinado: planoCodigo === "patrocinado",
        limite_lojas: Number(plano.limite_lojas || 1),
        plano_periodo: periodo,
        plano_inicio: ativacaoEm.toISOString(),
        plano_vencimento: novoVencimento.toISOString(),
        assinatura_status: "ativa",
        renovacao_automatica: false,
        cortesia_ate: null,
        aviso_7_dias: false,
        aviso_3_dias: false,
        aviso_1_dia: false,
        aviso_vencido: false,
      })
      .eq("id", lojaId);

    if (atualizarLojaError) {
      await supabaseAdmin
        .from("ativacoes_manuais_planos")
        .update({
          status: "cancelada",
          cancelado_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ativacaoManualId);

      return respostaErro(
        "Erro ao ativar o plano na loja",
        500,
        atualizarLojaError.message,
      );
    }

    const ativadoEm = new Date().toISOString();

    const { error: finalizarAtivacaoError } = await supabaseAdmin
      .from("ativacoes_manuais_planos")
      .update({
        status: "ativada",
        ativado_em: ativadoEm,
        updated_at: ativadoEm,
      })
      .eq("id", ativacaoManualId)
      .eq("status", "agendada");

    if (finalizarAtivacaoError) {
      const { error: restaurarLojaError } = await supabaseAdmin
        .from("lojas")
        .update({
          plano: loja.plano,
          premium: loja.premium,
          patrocinado: loja.patrocinado,
          limite_lojas: loja.limite_lojas,
          plano_periodo: loja.plano_periodo,
          plano_inicio: loja.plano_inicio,
          plano_vencimento: loja.plano_vencimento,
          assinatura_status: loja.assinatura_status,
          renovacao_automatica: loja.renovacao_automatica,
          cortesia_ate: loja.cortesia_ate,
          aviso_7_dias: loja.aviso_7_dias,
          aviso_3_dias: loja.aviso_3_dias,
          aviso_1_dia: loja.aviso_1_dia,
          aviso_vencido: loja.aviso_vencido,
        })
        .eq("id", lojaId);

      await supabaseAdmin
        .from("ativacoes_manuais_planos")
        .update({
          status: "cancelada",
          cancelado_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ativacaoManualId);

      return respostaErro(
        "Não foi possível finalizar a ativação administrativa",
        500,
        restaurarLojaError
          ? `${finalizarAtivacaoError.message}. A restauração da loja também falhou: ${restaurarLojaError.message}`
          : finalizarAtivacaoError.message,
      );
    }

    const mensagem =
      `O administrador ativou o plano ${planoCodigo} ` +
      `${nomePeriodo(periodo)} para a loja ${loja.nome}. ` +
      `O plano está válido até ${formatarData(novoVencimento)}. ` +
      `Motivo: ${motivo}`;

    const resultadosAuxiliares = await Promise.allSettled([
      supabaseAdmin
        .from("historico_assinaturas")
        .insert({
          loja_id: lojaId,
          evento: "ativacao_manual",
          plano_anterior: planoAnterior,
          plano_novo: planoCodigo,
          mensagem,
          usuario_id: user.id,
          referencia,
        })
        .throwOnError(),

      supabaseAdmin
        .from("notificacoes")
        .insert({
          loja_id: lojaId,
          titulo: "Plano ativado pelo administrador",
          mensagem,
          tipo: "assinatura",
          lida: false,
          icone: "payment",
          link: `/lojista/loja/${lojaId}`,
          enviada_em: ativadoEm,
        })
        .throwOnError(),
    ]);

    resultadosAuxiliares.forEach((resultado, indice) => {
      if (resultado.status === "rejected") {
        const aviso =
          indice === 0
            ? "Não foi possível registrar o histórico auxiliar"
            : "Não foi possível criar a notificação auxiliar";

        avisos.push(aviso);
        console.error(aviso, resultado.reason);
      }
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Plano ativado manualmente com sucesso",
      ativacao: {
        id: ativacaoManualId,
        loja_id: lojaId,
        plano: planoCodigo,
        periodo,
        tipo_ativacao: tipoAtivacao,
        status: "ativada",
        ativacao_em: ativacaoEm.toISOString(),
        novo_vencimento: novoVencimento.toISOString(),
        ativado_em: ativadoEm,
      },
      avisos,
    });
  } catch (error: any) {
    console.error(
      "Erro inesperado na ativação administrativa:",
      error?.message || error,
    );

    if (supabaseAdmin && ativacaoManualId) {
      await supabaseAdmin
        .from("ativacoes_manuais_planos")
        .update({
          status: "cancelada",
          cancelado_em: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ativacaoManualId)
        .eq("status", "agendada");
    }

    return respostaErro(
      "Erro inesperado ao processar a ativação administrativa",
      500,
      error?.message || "Erro desconhecido",
    );
  }
}