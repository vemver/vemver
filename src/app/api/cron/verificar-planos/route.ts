import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { criarNotificacao } from "@/app/lib/notificacoes";
import { registrarHistorico } from "@/app/lib/historico";
const supabaseUrl =
  "https://bwyqesogduegtoookdhu.supabase.co";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

type LojaAviso = {
  id: number;
  nome: string;
  plano: string;
  plano_vencimento: string;
  aviso_7_dias: boolean;
  aviso_3_dias: boolean;
  aviso_1_dia: boolean;
};

type PagamentoAgendado = {
  id: number;
  loja_id: number;
  plano: string;
  plano_id: number | null;
  periodo: string | null;
  meses: number | null;
  ativacao_em: string;
  novo_vencimento: string;
  mp_payment_id: string | null;
};

type MudancaAtivada = {
  pagamentoId: number;
  lojaId: number;
  nome: string;
  planoAnterior: string;
  planoNovo: string;
  periodo: string;
  ativacaoEm: string;
  novoVencimento: string;
};

function normalizarTexto(valor: unknown) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function dataValida(valor: unknown) {
  if (!valor) return null;

  const data = new Date(String(valor));

  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

function criarIntervaloDoDia(diasAFrente: number) {
  const inicio = new Date();

  inicio.setUTCDate(
    inicio.getUTCDate() + diasAFrente
  );

  inicio.setUTCHours(0, 0, 0, 0);

  const fim = new Date(inicio);

  fim.setUTCHours(23, 59, 59, 999);

  return {
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  };
}

async function buscarLojasParaAviso(
  supabaseAdmin: any,
  diasAFrente: number,
  colunaAviso:
    | "aviso_7_dias"
    | "aviso_3_dias"
    | "aviso_1_dia"
) {
  const intervalo =
    criarIntervaloDoDia(diasAFrente);

  const { data, error } = await supabaseAdmin
    .from("lojas")
    .select(
      `
        id,
        nome,
        plano,
        plano_vencimento,
        aviso_7_dias,
        aviso_3_dias,
        aviso_1_dia
      `
    )
    .eq("assinatura_status", "ativa")
    .eq(colunaAviso, false)
    .not("plano_vencimento", "is", null)
    .gte(
      "plano_vencimento",
      intervalo.inicio
    )
    .lte(
      "plano_vencimento",
      intervalo.fim
    );

  if (error) {
    throw new Error(
      `Erro ao buscar aviso de ${diasAFrente} dia(s): ${error.message}`
    );
  }

  return (data || []) as LojaAviso[];
}
async function processarAvisos(
  supabaseAdmin: any,
  lojas: LojaAviso[],
  diasRestantes: 7 | 3 | 1,
  colunaAviso:
    | "aviso_7_dias"
    | "aviso_3_dias"
    | "aviso_1_dia"
) {
  let avisosCriados = 0;

  for (const loja of lojas) {
    const textoDias =
      diasRestantes === 1
        ? "amanhã"
        : `em ${diasRestantes} dias`;

    const titulo =
      diasRestantes === 1
        ? "Seu plano vence amanhã"
        : `Seu plano vence em ${diasRestantes} dias`;

    const mensagem =
      `O plano ${loja.plano} da loja ${loja.nome} vence ${textoDias}. ` +
      "Renove para continuar utilizando todos os benefícios.";

    try {
      await criarNotificacao({
        lojaId: Number(loja.id),
        titulo,
        mensagem,
        tipo: "assinatura",
        icone: "warning",
        link: `/lojista/loja/${loja.id}`,
      });

      await registrarHistorico({
        lojaId: Number(loja.id),
        evento: `aviso_${diasRestantes}_dias`,
        planoAnterior: loja.plano,
        planoNovo: loja.plano,
        mensagem,
        referencia: `cron-aviso-${diasRestantes}-dias`,
      });

      const { error: marcarAvisoError } =
        await supabaseAdmin
          .from("lojas")
          .update({
            [colunaAviso]: true,
          })
          .eq("id", loja.id);

      if (marcarAvisoError) {
        throw new Error(
          `Erro ao marcar aviso como enviado: ${marcarAvisoError.message}`
        );
      }

      avisosCriados++;
    } catch (error: any) {
      console.error(
        `Erro ao processar aviso de ${diasRestantes} dia(s) da loja ${loja.id}:`,
        error?.message || error
      );
    }
  }

  return avisosCriados;
}

async function processarMudancasAgendadas(
  supabaseAdmin: any,
  agora: Date
) {
  const agoraIso = agora.toISOString();

  const {
    data: pagamentosAgendados,
    error: buscarAgendadosError,
  } = await supabaseAdmin
    .from("pagamentos")
    .select(
      `
        id,
        loja_id,
        plano,
        plano_id,
        periodo,
        meses,
        ativacao_em,
        novo_vencimento,
        mp_payment_id
      `
    )
    .eq("status", "approved")
    .eq("tipo_mudanca", "downgrade")
    .not("processado_em", "is", null)
    .is("ativado_em", null)
    .not("ativacao_em", "is", null)
    .not("novo_vencimento", "is", null)
    .lte("ativacao_em", agoraIso)
    .order("ativacao_em", {
      ascending: true,
    });

  if (buscarAgendadosError) {
    throw new Error(
      `Erro ao buscar mudanças agendadas: ${buscarAgendadosError.message}`
    );
  }

  const mudancasAtivadas: MudancaAtivada[] =
    [];

  for (
    const pagamento of (
      pagamentosAgendados || []
    ) as PagamentoAgendado[]
  ) {
    try {
      const lojaId = Number(
        pagamento.loja_id
      );

      if (
        !Number.isInteger(lojaId) ||
        lojaId <= 0
      ) {
        throw new Error(
          "Pagamento agendado sem loja válida"
        );
      }

      const ativacaoEm = dataValida(
        pagamento.ativacao_em
      );

      const novoVencimento = dataValida(
        pagamento.novo_vencimento
      );

      if (
        !ativacaoEm ||
        !novoVencimento
      ) {
        throw new Error(
          "Pagamento agendado com datas inválidas"
        );
      }

      let planoQuery = supabaseAdmin
        .from("planos_catalogo")
        .select(
          `
            id,
            codigo,
            periodo,
            meses,
            limite_lojas
          `
        );

      if (pagamento.plano_id) {
        planoQuery = planoQuery.eq(
          "id",
          Number(pagamento.plano_id)
        );
      } else {
        planoQuery = planoQuery
          .eq(
            "codigo",
            normalizarTexto(
              pagamento.plano
            )
          )
          .eq(
            "periodo",
            normalizarTexto(
              pagamento.periodo
            )
          );
      }

      const {
        data: planoCatalogo,
        error: planoError,
      } = await planoQuery.maybeSingle();

      if (planoError) {
        throw new Error(
          `Erro ao consultar o novo plano: ${planoError.message}`
        );
      }

      if (!planoCatalogo) {
        throw new Error(
          "Novo plano não encontrado no catálogo"
        );
      }

      const planoNovo = normalizarTexto(
        planoCatalogo.codigo
      );

      const periodoNovo =
        normalizarTexto(
          pagamento.periodo ||
            planoCatalogo.periodo
        );

      const codigosPermitidos = [
        "premium",
        "patrocinado",
        "multiunidade",
      ];

      const periodosPermitidos = [
        "mensal",
        "trimestral",
        "anual",
      ];

      if (
        !codigosPermitidos.includes(
          planoNovo
        ) ||
        !periodosPermitidos.includes(
          periodoNovo
        )
      ) {
        throw new Error(
          "Plano ou período agendado inválido"
        );
      }

      const {
        data: lojaAtual,
        error: lojaError,
      } = await supabaseAdmin
        .from("lojas")
        .select(
          `
            id,
            nome,
            plano,
            user_id
          `
        )
        .eq("id", lojaId)
        .maybeSingle();

      if (lojaError) {
        throw new Error(
          `Erro ao consultar a loja: ${lojaError.message}`
        );
      }

      if (!lojaAtual) {
        throw new Error(
          "Loja da mudança agendada não encontrada"
        );
      }

      const planoAnterior =
        normalizarTexto(
          lojaAtual.plano || "gratis"
        ) || "gratis";

      const { error: atualizarLojaError } =
        await supabaseAdmin
          .from("lojas")
          .update({
            plano: planoNovo,
            premium: true,
            patrocinado:
              planoNovo ===
              "patrocinado",
            limite_lojas: Number(
              planoCatalogo.limite_lojas ||
                1
            ),
            plano_periodo:
              periodoNovo,
            plano_inicio:
              ativacaoEm.toISOString(),
            plano_vencimento:
              novoVencimento.toISOString(),
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
        throw new Error(
          `Erro ao ativar o novo plano: ${atualizarLojaError.message}`
        );
      }

      const ativadoEm =
        new Date().toISOString();

      const {
        data: pagamentoAtivado,
        error: finalizarMudancaError,
      } = await supabaseAdmin
        .from("pagamentos")
        .update({
          ativado_em: ativadoEm,
          updated_at: ativadoEm,
        })
        .eq("id", pagamento.id)
        .is("ativado_em", null)
        .select("id")
        .maybeSingle();

      if (finalizarMudancaError) {
        throw new Error(
          `Erro ao finalizar a mudança: ${finalizarMudancaError.message}`
        );
      }

      if (!pagamentoAtivado) {
        continue;
      }

      const dataVencimentoFormatada =
        novoVencimento.toLocaleDateString(
          "pt-BR",
          {
            timeZone:
              "America/Sao_Paulo",
          }
        );

      const mensagem =
        `A mudança agendada da loja ${lojaAtual.nome} foi concluída. ` +
        `O plano ${planoNovo} está ativo até ` +
        `${dataVencimentoFormatada}.`;

      const resultados =
        await Promise.allSettled([
          criarNotificacao({
            lojaId,
            titulo:
              "Mudança de plano concluída",
            mensagem,
            tipo: "assinatura",
            icone: "payment",
            link:
              `/lojista/loja/${lojaId}`,
          }),

          registrarHistorico({
            lojaId,
            evento:
              "downgrade_ativado",
            planoAnterior,
            planoNovo,
            mensagem,
            usuarioId:
              lojaAtual.user_id ||
              null,
            referencia:
              pagamento.mp_payment_id ||
              `pagamento-${pagamento.id}`,
          }),
        ]);

      resultados.forEach(
        (resultado, indice) => {
          if (
            resultado.status ===
            "rejected"
          ) {
            console.error(
              indice === 0
                ? `Erro ao criar notificação da mudança ${pagamento.id}:`
                : `Erro ao registrar histórico da mudança ${pagamento.id}:`,
              resultado.reason
            );
          }
        }
      );

      mudancasAtivadas.push({
        pagamentoId:
          Number(pagamento.id),
        lojaId,
        nome: lojaAtual.nome,
        planoAnterior,
        planoNovo,
        periodo: periodoNovo,
        ativacaoEm:
          ativacaoEm.toISOString(),
        novoVencimento:
          novoVencimento.toISOString(),
      });
    } catch (error: any) {
      console.error(
        `Erro ao processar mudança agendada ${pagamento.id}:`,
        error?.message || error
      );
    }
  }

  return mudancasAtivadas;
}

export async function GET() {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        {
          sucesso: false,
          erro:
            "SUPABASE_SERVICE_ROLE_KEY não configurada",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const agora = new Date();
    const agoraIso = agora.toISOString();

    /*
     * 0. Ativa downgrades já pagos cuja data
     * programada chegou. Esta etapa precisa
     * acontecer antes da verificação de
     * vencimento e da entrada em cortesia.
     */
    const mudancasAgendadasAtivadas =
      await processarMudancasAgendadas(
        supabaseAdmin,
        agora
      );

    /*
     * 1. Identifica lojas que precisam receber avisos.
     *
     * Nesta etapa ainda não enviamos mensagens
     * e não alteramos os campos aviso_7_dias,
     * aviso_3_dias e aviso_1_dia.
     */
    const [
      lojasAviso7Dias,
      lojasAviso3Dias,
      lojasAviso1Dia,
    ] = await Promise.all([
      buscarLojasParaAviso(
        supabaseAdmin,
        7,
        "aviso_7_dias"
      ),

      buscarLojasParaAviso(
        supabaseAdmin,
        3,
        "aviso_3_dias"
      ),

      buscarLojasParaAviso(
        supabaseAdmin,
        1,
        "aviso_1_dia"
      ),
    ]);
const avisos7DiasCriados =
  await processarAvisos(
    supabaseAdmin,
    lojasAviso7Dias,
    7,
    "aviso_7_dias"
  );

const avisos3DiasCriados =
  await processarAvisos(
    supabaseAdmin,
    lojasAviso3Dias,
    3,
    "aviso_3_dias"
  );

const avisos1DiaCriados =
  await processarAvisos(
    supabaseAdmin,
    lojasAviso1Dia,
    1,
    "aviso_1_dia"
  );
    /*
     * 2. Localiza assinaturas ativas que venceram.
     *
     * Elas continuam com os benefícios
     * e entram em 3 dias de cortesia.
     */
    const {
      data: lojasParaCortesia,
      error: buscaCortesiaError,
    } = await supabaseAdmin
      .from("lojas")
      .select(
        `
          id,
          nome,
          plano,
          plano_vencimento,
          assinatura_status
        `
      )
      .eq("assinatura_status", "ativa")
      .not("plano_vencimento", "is", null)
      .lt("plano_vencimento", agoraIso);

    if (buscaCortesiaError) {
      console.error(
        "Erro ao buscar lojas para cortesia:",
        buscaCortesiaError
      );

      return NextResponse.json(
        {
          sucesso: false,
          erro:
            "Erro ao buscar assinaturas vencidas",
          detalhes:
            buscaCortesiaError.message,
        },
        { status: 500 }
      );
    }

    let lojasEmCortesia = 0;

    if (
      lojasParaCortesia &&
      lojasParaCortesia.length > 0
    ) {
      const fimDaCortesia = new Date(agora);

      fimDaCortesia.setDate(
        fimDaCortesia.getDate() + 3
      );

      const idsParaCortesia =
        lojasParaCortesia.map(
          (loja) => loja.id
        );

      const { error: ativarCortesiaError } =
        await supabaseAdmin
          .from("lojas")
          .update({
            assinatura_status: "cortesia",
            cortesia_ate:
              fimDaCortesia.toISOString(),
            aviso_vencido: false,
            renovacao_automatica: false,
          })
          .in("id", idsParaCortesia);

      if (ativarCortesiaError) {
        console.error(
          "Erro ao ativar período de cortesia:",
          ativarCortesiaError
        );

        return NextResponse.json(
          {
            sucesso: false,
            erro:
              "Erro ao ativar período de cortesia",
            detalhes:
              ativarCortesiaError.message,
          },
          { status: 500 }
        );
      }

      lojasEmCortesia =
        lojasParaCortesia.length;
    }
for (const loja of lojasParaCortesia) {
  const mensagem =
    `O plano ${loja.plano} da loja ${loja.nome} venceu. ` +
    "Você recebeu 3 dias de cortesia para renovar sem perder os benefícios.";

  const resultados = await Promise.allSettled([
    criarNotificacao({
      lojaId: Number(loja.id),
      titulo: "Você recebeu 3 dias de cortesia",
      mensagem,
      tipo: "cortesia",
      icone: "gift",
      link: `/lojista/loja/${loja.id}`,
    }),

    registrarHistorico({
      lojaId: Number(loja.id),
      evento: "inicio_cortesia",
      planoAnterior: loja.plano,
      planoNovo: loja.plano,
      mensagem,
      referencia: "cron-inicio-cortesia",
    }),
  ]);

  resultados.forEach((resultado, indice) => {
    if (resultado.status === "rejected") {
      console.error(
        indice === 0
          ? `Erro ao criar notificação de cortesia da loja ${loja.id}:`
          : `Erro ao registrar histórico de cortesia da loja ${loja.id}:`,
        resultado.reason
      );
    }
  });
}
    /*
     * 3. Localiza lojas cujo período
     * de cortesia já terminou.
     */
    const {
      data: lojasComCortesiaVencida,
      error: buscaVencidasError,
    } = await supabaseAdmin
      .from("lojas")
      .select(
        `
          id,
          nome,
          plano,
          cortesia_ate,
          assinatura_status
        `
      )
      .eq("assinatura_status", "cortesia")
      .not("cortesia_ate", "is", null)
      .lt("cortesia_ate", agoraIso);

    if (buscaVencidasError) {
      console.error(
        "Erro ao buscar cortesias vencidas:",
        buscaVencidasError
      );

      return NextResponse.json(
        {
          sucesso: false,
          erro:
            "Erro ao buscar períodos de cortesia vencidos",
          detalhes:
            buscaVencidasError.message,
        },
        { status: 500 }
      );
    }

    let lojasRetornadasAoGratis = 0;

    if (
      lojasComCortesiaVencida &&
      lojasComCortesiaVencida.length > 0
    ) {
      const idsCortesiaVencida =
        lojasComCortesiaVencida.map(
          (loja) => loja.id
        );

      const { error: voltarGratisError } =
        await supabaseAdmin
          .from("lojas")
          .update({
            plano: "gratis",
            premium: false,
            patrocinado: false,
            limite_lojas: 1,
            assinatura_status: "vencida",
            plano_periodo: null,
            plano_inicio: null,
            plano_vencimento: null,
            cortesia_ate: null,
            renovacao_automatica: false,
          })
          .in("id", idsCortesiaVencida);

      if (voltarGratisError) {
        console.error(
          "Erro ao retornar lojas ao plano grátis:",
          voltarGratisError
        );

        return NextResponse.json(
          {
            sucesso: false,
            erro:
              "Erro ao retornar lojas ao plano grátis",
            detalhes:
              voltarGratisError.message,
          },
          { status: 500 }
        );
      }

      lojasRetornadasAoGratis =
        lojasComCortesiaVencida.length;
    }
for (const loja of lojasComCortesiaVencida) {
  const mensagem =
    `O período de cortesia da loja ${loja.nome} terminou. ` +
    "A loja voltou automaticamente para o plano grátis.";

  const resultados = await Promise.allSettled([
    criarNotificacao({
      lojaId: Number(loja.id),
      titulo: "Período de cortesia encerrado",
      mensagem,
      tipo: "assinatura",
      icone: "warning",
      link: `/lojista/loja/${loja.id}`,
    }),

    registrarHistorico({
      lojaId: Number(loja.id),
      evento: "fim_cortesia",
      planoAnterior: loja.plano,
      planoNovo: "gratis",
      mensagem,
      referencia: "cron-fim-cortesia",
    }),
  ]);

  resultados.forEach((resultado, indice) => {
    if (resultado.status === "rejected") {
      console.error(
        indice === 0
          ? `Erro ao criar notificação de fim de cortesia da loja ${loja.id}:`
          : `Erro ao registrar histórico de fim de cortesia da loja ${loja.id}:`,
        resultado.reason
      );
    }
  });
}
    return NextResponse.json({
      sucesso: true,
      mensagem:
        "Verificação de assinaturas concluída.",

      mudancasAgendadas: {
        ativadas:
          mudancasAgendadasAtivadas.length,
        lojas:
          mudancasAgendadasAtivadas,
      },

      avisosPendentes: {
        seteDias: lojasAviso7Dias.length,
        tresDias: lojasAviso3Dias.length,
        umDia: lojasAviso1Dia.length,
      },

      lojasParaAviso: {
        seteDias: lojasAviso7Dias.map(
          (loja) => ({
            id: loja.id,
            nome: loja.nome,
            plano: loja.plano,
            vencimento:
              loja.plano_vencimento,
          })
        ),

        tresDias: lojasAviso3Dias.map(
          (loja) => ({
            id: loja.id,
            nome: loja.nome,
            plano: loja.plano,
            vencimento:
              loja.plano_vencimento,
          })
        ),

        umDia: lojasAviso1Dia.map(
          (loja) => ({
            id: loja.id,
            nome: loja.nome,
            plano: loja.plano,
            vencimento:
              loja.plano_vencimento,
          })
        ),
      },

      lojasEmCortesia,

      lojasRetornadasAoGratis,

      cortesiaIniciada: (
        lojasParaCortesia || []
      ).map((loja) => ({
        id: loja.id,
        nome: loja.nome,
        plano: loja.plano,
        vencimento:
          loja.plano_vencimento,
      })),

      cortesiaEncerrada: (
        lojasComCortesiaVencida || []
      ).map((loja) => ({
        id: loja.id,
        nome: loja.nome,
        planoAnterior: loja.plano,
        cortesiaAte: loja.cortesia_ate,
      })),
    });
  } catch (error: any) {
    console.error(
      "Erro inesperado ao verificar planos:",
      error?.message || error
    );

    return NextResponse.json(
      {
        sucesso: false,
        erro:
          "Erro inesperado ao verificar planos",
        detalhes:
          error?.message ||
          "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}