import { createClient } from "@supabase/supabase-js"
import {
  MercadoPagoConfig,
  MerchantOrder,
  Payment,
} from "mercadopago"
import { NextResponse } from "next/server"

import { criarNotificacao } from "../../../lib/notificacoes"
import { registrarHistorico } from "../../../lib/historico"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://bwyqesogduegtoookdhu.supabase.co"

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const mercadoPagoToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN || ""

type PeriodoPlano =
  | "mensal"
  | "trimestral"
  | "anual"

type TipoMudanca =
  | "contratacao"
  | "renovacao"
  | "upgrade"
  | "downgrade"

const hierarquiaPlanos: Record<
  string,
  number
> = {
  gratis: 0,
  premium: 1,
  patrocinado: 2,
  multiunidade: 3,
  franquia: 4,
}

function normalizarTexto(valor: unknown) {
  return String(valor || "")
    .trim()
    .toLowerCase()
}

function dataValida(valor: unknown) {
  if (!valor) return null

  const data = new Date(String(valor))

  if (Number.isNaN(data.getTime())) {
    return null
  }

  return data
}

function tipoMudancaValido(
  valor: string
): valor is TipoMudanca {
  return (
    valor === "contratacao" ||
    valor === "renovacao" ||
    valor === "upgrade" ||
    valor === "downgrade"
  )
}

function adicionarMeses(
  dataBase: Date,
  quantidadeMeses: number
) {
  const resultado = new Date(dataBase)
  const diaOriginal = resultado.getUTCDate()

  resultado.setUTCDate(1)
  resultado.setUTCMonth(
    resultado.getUTCMonth() +
      quantidadeMeses
  )

  const ultimoDiaDoMes = new Date(
    Date.UTC(
      resultado.getUTCFullYear(),
      resultado.getUTCMonth() + 1,
      0
    )
  ).getUTCDate()

  resultado.setUTCDate(
    Math.min(
      diaOriginal,
      ultimoDiaDoMes
    )
  )

  return resultado
}

function periodoValido(
  valor: string
): valor is PeriodoPlano {
  return (
    valor === "mensal" ||
    valor === "trimestral" ||
    valor === "anual"
  )
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    webhook: "mercadopago",
  })
}

export async function POST(request: Request) {
  try {
    if (
      !supabaseUrl ||
      !supabaseServiceKey ||
      !mercadoPagoToken
    ) {
      console.error(
        "Variáveis do webhook não configuradas"
      )

      return NextResponse.json(
        {
          error:
            "Configuração incompleta",
        },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const mpClient =
      new MercadoPagoConfig({
        accessToken: mercadoPagoToken,
      })

    const body = await request.json()
    const url = new URL(request.url)

    const topic =
      body?.topic ||
      body?.type ||
      url.searchParams.get("topic") ||
      url.searchParams.get("type")

    const eventoId =
      body?.data?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.resource
        ?.split("/")
        ?.pop() ||
      body?.id

    if (!eventoId) {
      return NextResponse.json({
        recebido: true,
        motivo:
          "Notificação sem identificação",
      })
    }

    let paymentId = String(eventoId)
    let merchantPreferenceId = ""
    let merchantLojaId = ""

    const ehMerchantOrder = String(
      topic || ""
    )
      .toLowerCase()
      .includes("merchant_order")

    if (ehMerchantOrder) {
      const merchantOrder =
        new MerchantOrder(mpClient)

      const merchantOrderData: any =
        await merchantOrder.get({
          merchantOrderId:
            String(eventoId),
        })

      merchantPreferenceId = String(
        merchantOrderData.preference_id ||
          ""
      )

      merchantLojaId = String(
        merchantOrderData.external_reference ||
          ""
      )

      const pagamentoAprovado =
        merchantOrderData.payments?.find(
          (pagamento: any) =>
            pagamento.status ===
            "approved"
        )

      const primeiroPagamento =
        merchantOrderData.payments?.[0]

      paymentId = String(
        pagamentoAprovado?.id ||
          primeiroPagamento?.id ||
          ""
      )

      if (!paymentId) {
        return NextResponse.json({
          recebido: true,
          motivo:
            "Merchant order ainda sem pagamento",
        })
      }
    }

    const payment = new Payment(mpClient)
    let paymentData: any

    try {
      paymentData = await payment.get({
        id: paymentId,
      })
    } catch (paymentError: any) {
      console.warn(
        "Notificação ignorada: pagamento não encontrado:",
        {
          topic,
          eventoId,
          paymentId,
          mensagem:
            paymentError?.message ||
            "Erro desconhecido",
        }
      )

      return NextResponse.json({
        recebido: true,
        ignorado: true,
        motivo:
          "Pagamento não encontrado",
      })
    }

    const status = String(
      paymentData.status || ""
    ).toLowerCase()

    const preferenceId = String(
      paymentData.preference_id ||
        merchantPreferenceId ||
        ""
    )

    const lojaIdRecebido = String(
      paymentData.metadata?.loja_id ||
        paymentData.external_reference ||
        merchantLojaId ||
        ""
    )

    if (!preferenceId) {
      return NextResponse.json({
        recebido: true,
        motivo:
          "Notificação sem preferenceId",
      })
    }

    const {
      data: pagamento,
      error: pagamentoError,
    } = await supabaseAdmin
      .from("pagamentos")
      .select("*")
      .eq(
        "mp_preference_id",
        preferenceId
      )
      .maybeSingle()

    if (pagamentoError) {
      console.error(
        "Erro ao localizar pagamento:",
        pagamentoError
      )

      return NextResponse.json(
        {
          error:
            "Erro ao consultar pagamento",
        },
        { status: 500 }
      )
    }

    if (!pagamento) {
      return NextResponse.json({
        recebido: true,
        motivo:
          "Pagamento não encontrado no banco",
        preferenceId,
      })
    }

    if (pagamento.processado_em) {
      return NextResponse.json({
        recebido: true,
        duplicado: true,
        status:
          pagamento.status || status,
        paymentId,
      })
    }

    /*
     * Pagamentos ainda não aprovados apenas
     * atualizam o status. Os benefícios da loja
     * não são alterados.
     */
    if (status !== "approved") {
      const { error: statusError } =
        await supabaseAdmin
          .from("pagamentos")
          .update({
            status,
            mp_payment_id: paymentId,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", pagamento.id)

      if (statusError) {
        console.error(
          "Erro ao atualizar status do pagamento:",
          statusError
        )

        return NextResponse.json(
          {
            error:
              "Erro ao atualizar pagamento",
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        recebido: true,
        status,
      })
    }

    const valorEsperado = Number(
      pagamento.valor
    )

    const valorRecebido = Number(
      paymentData.transaction_amount
    )

    const moedaRecebida = String(
      paymentData.currency_id || ""
    ).toUpperCase()

    const valorDivergente =
      !Number.isFinite(valorEsperado) ||
      !Number.isFinite(valorRecebido) ||
      Math.abs(
        valorEsperado - valorRecebido
      ) > 0.01 ||
      moedaRecebida !== "BRL"

    if (valorDivergente) {
      console.error(
        "Pagamento com valor ou moeda divergente:",
        {
          pagamentoId: pagamento.id,
          valorEsperado,
          valorRecebido,
          moedaRecebida,
        }
      )

      await supabaseAdmin
        .from("pagamentos")
        .update({
          status: "valor_divergente",
          mp_payment_id: paymentId,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", pagamento.id)

      return NextResponse.json(
        {
          recebido: true,
          processado: false,
          motivo:
            "Valor ou moeda divergente",
        },
        { status: 400 }
      )
    }

    const lojaId = Number(
      pagamento.loja_id
    )

    if (
      !Number.isInteger(lojaId) ||
      lojaId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Pagamento sem loja válida",
        },
        { status: 400 }
      )
    }

    if (
      lojaIdRecebido &&
      Number(lojaIdRecebido) !== lojaId
    ) {
      console.error(
        "Loja divergente na notificação:",
        {
          lojaIdBanco: lojaId,
          lojaIdRecebido,
          preferenceId,
        }
      )

      return NextResponse.json(
        {
          error:
            "Loja divergente no pagamento",
        },
        { status: 400 }
      )
    }

    const periodoPagamento = String(
      pagamento.periodo || "mensal"
    )
      .trim()
      .toLowerCase()

    let planoQuery = supabaseAdmin
      .from("planos_catalogo")
      .select(
        `
          id,
          codigo,
          nome,
          periodo,
          meses,
          limite_lojas,
          ativo
        `
      )

    if (pagamento.plano_id) {
      planoQuery = planoQuery.eq(
        "id",
        Number(pagamento.plano_id)
      )
    } else {
      planoQuery = planoQuery
        .eq(
          "codigo",
          String(pagamento.plano || "")
        )
        .eq(
          "periodo",
          periodoPagamento
        )
    }

    const {
      data: planoCatalogo,
      error: planoError,
    } = await planoQuery.maybeSingle()

    if (planoError) {
      console.error(
        "Erro ao consultar plano:",
        planoError
      )

      return NextResponse.json(
        {
          error:
            "Erro ao consultar plano",
        },
        { status: 500 }
      )
    }

    if (!planoCatalogo) {
      return NextResponse.json(
        {
          error:
            "Plano do pagamento não encontrado",
        },
        { status: 400 }
      )
    }

    const plano = String(
      planoCatalogo.codigo || ""
    )
      .trim()
      .toLowerCase()

    const codigosPermitidos = [
      "premium",
      "patrocinado",
      "multiunidade",
    ]

    if (
      !codigosPermitidos.includes(plano)
    ) {
      return NextResponse.json(
        {
          error:
            "Plano do pagamento não reconhecido",
        },
        { status: 400 }
      )
    }

    const periodoCatalogo = String(
      planoCatalogo.periodo || ""
    )
      .trim()
      .toLowerCase()

    const periodo = periodoValido(
      periodoPagamento
    )
      ? periodoPagamento
      : periodoCatalogo

    if (!periodoValido(periodo)) {
      return NextResponse.json(
        {
          error:
            "Período do pagamento inválido",
        },
        { status: 400 }
      )
    }

    const meses = Number(
      pagamento.meses ||
        planoCatalogo.meses
    )

    if (
      !Number.isInteger(meses) ||
      meses <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Duração do plano inválida",
        },
        { status: 400 }
      )
    }

    const {
      data: lojaAtual,
      error: buscarLojaError,
    } = await supabaseAdmin
      .from("lojas")
      .select(
        `
          id,
          nome,
          plano,
          user_id,
          plano_inicio,
          plano_vencimento,
          assinatura_status
        `
      )
      .eq("id", lojaId)
      .maybeSingle()

    if (buscarLojaError) {
      console.error(
        "Erro ao buscar loja:",
        buscarLojaError
      )

      return NextResponse.json(
        {
          error:
            "Erro ao localizar loja",
        },
        { status: 500 }
      )
    }

    if (!lojaAtual) {
      return NextResponse.json(
        {
          error:
            "Loja não encontrada",
        },
        { status: 404 }
      )
    }

    const agora = new Date()
    const agoraIso = agora.toISOString()

    const planoAnteriorAtual =
      normalizarTexto(
        lojaAtual.plano || "gratis"
      ) || "gratis"

    const planoAnteriorPagamento =
      normalizarTexto(
        pagamento.plano_anterior ||
          planoAnteriorAtual
      ) || "gratis"

    const tipoRegistrado =
      normalizarTexto(
        pagamento.tipo_mudanca
      )

    const vencimentoAtual =
      dataValida(
        lojaAtual.plano_vencimento
      )

    const planoAtualVigente =
      normalizarTexto(
        lojaAtual.assinatura_status
      ) === "ativa" &&
      vencimentoAtual !== null &&
      vencimentoAtual.getTime() >
        agora.getTime() &&
      planoAnteriorAtual !== "gratis"

    let tipoMudanca: TipoMudanca

    if (
      tipoMudancaValido(
        tipoRegistrado
      )
    ) {
      tipoMudanca = tipoRegistrado
    } else if (!planoAtualVigente) {
      tipoMudanca = "contratacao"
    } else if (
      planoAnteriorAtual === plano
    ) {
      tipoMudanca = "renovacao"
    } else {
      const nivelAnterior =
        hierarquiaPlanos[
          planoAnteriorAtual
        ] ?? 0

      const nivelNovo =
        hierarquiaPlanos[plano] ?? 0

      tipoMudanca =
        nivelNovo > nivelAnterior
          ? "upgrade"
          : "downgrade"
    }

    let ativacaoEm =
      dataValida(
        pagamento.ativacao_em
      )

    if (!ativacaoEm) {
      ativacaoEm =
        (
          tipoMudanca ===
            "renovacao" ||
          tipoMudanca ===
            "downgrade"
        ) &&
        vencimentoAtual
          ? vencimentoAtual
          : agora
    }

    let novoVencimento =
      dataValida(
        pagamento.novo_vencimento
      )

    if (!novoVencimento) {
      const baseDoVencimento =
        (
          tipoMudanca ===
            "renovacao" ||
          tipoMudanca ===
            "downgrade"
        )
          ? ativacaoEm
          : agora

      novoVencimento =
        adicionarMeses(
          baseDoVencimento,
          meses
        )
    }

    const dadosFixosPagamento = {
      plano: plano,
      plano_id:
        Number(planoCatalogo.id),
      periodo,
      meses,
      tipo_mudanca:
        tipoMudanca,
      plano_anterior:
        planoAnteriorPagamento,
      periodo_anterior:
        pagamento.periodo_anterior ||
        null,
      valor_tabela:
        Number(
          pagamento.valor_tabela ||
            valorEsperado
        ),
      credito_aplicado:
        Number(
          pagamento.credito_aplicado ||
            0
        ),
      ativacao_em:
        ativacaoEm.toISOString(),
      novo_vencimento:
        novoVencimento.toISOString(),
    }

    /*
     * Downgrade pago antes do fim do plano
     * atual fica aprovado e agendado. A loja
     * mantém os benefícios atuais até a data
     * registrada em ativacao_em.
     */
    const downgradeAgendado =
      tipoMudanca === "downgrade" &&
      ativacaoEm.getTime() >
        agora.getTime()

    const processadoEm = agoraIso

    if (downgradeAgendado) {
      const {
        data: pagamentoAgendado,
        error:
          agendarPagamentoError,
      } = await supabaseAdmin
        .from("pagamentos")
        .update({
          ...dadosFixosPagamento,
          status: "approved",
          mp_payment_id: paymentId,
          processado_em:
            processadoEm,
          ativado_em: null,
          updated_at:
            processadoEm,
        })
        .eq("id", pagamento.id)
        .is("processado_em", null)
        .select("id")
        .maybeSingle()

      if (agendarPagamentoError) {
        console.error(
          "Erro ao agendar downgrade:",
          agendarPagamentoError
        )

        return NextResponse.json(
          {
            error:
              "Erro ao agendar mudança de plano",
          },
          { status: 500 }
        )
      }

      if (!pagamentoAgendado) {
        return NextResponse.json({
          recebido: true,
          duplicado: true,
          status: "approved",
          paymentId,
        })
      }

      const dataAtivacaoFormatada =
        ativacaoEm.toLocaleDateString(
          "pt-BR",
          {
            timeZone:
              "America/Sao_Paulo",
          }
        )

      const dataVencimentoFormatada =
        novoVencimento.toLocaleDateString(
          "pt-BR",
          {
            timeZone:
              "America/Sao_Paulo",
          }
        )

      const mensagemAgendamento =
        `Pagamento aprovado. A mudança do plano ` +
        `${planoAnteriorPagamento} para ${plano} ` +
        `foi agendada para ${dataAtivacaoFormatada}. ` +
        `O novo período ficará válido até ` +
        `${dataVencimentoFormatada}.`

      const resultadoRegistros =
        await Promise.allSettled([
          registrarHistorico({
            lojaId,
            evento:
              "downgrade_agendado",
            planoAnterior:
              planoAnteriorPagamento,
            planoNovo: plano,
            mensagem:
              mensagemAgendamento,
            usuarioId:
              lojaAtual.user_id ||
              null,
            valor: valorEsperado,
            referencia: paymentId,
          }),

          criarNotificacao({
            lojaId,
            titulo:
              "Mudança de plano agendada",
            mensagem:
              mensagemAgendamento,
            tipo: "pagamento",
            icone: "schedule",
            link:
              `/lojista/loja/${lojaId}`,
          }),
        ])

      resultadoRegistros.forEach(
        (resultado, indice) => {
          if (
            resultado.status ===
            "rejected"
          ) {
            console.error(
              indice === 0
                ? "Erro ao registrar histórico:"
                : "Erro ao criar notificação:",
              resultado.reason
            )
          }
        }
      )

      return NextResponse.json({
        recebido: true,
        status: "approved",
        agendado: true,
        tipoMudanca,
        plano,
        periodo,
        meses,
        lojaId,
        paymentId,
        ativacao:
          ativacaoEm.toISOString(),
        vencimento:
          novoVencimento.toISOString(),
      })
    }

    const manterInicioAtual =
      tipoMudanca === "renovacao" &&
      normalizarTexto(
        lojaAtual.assinatura_status
      ) === "ativa" &&
      Boolean(lojaAtual.plano_inicio)

    const planoInicio =
      manterInicioAtual
        ? lojaAtual.plano_inicio
        : tipoMudanca ===
            "downgrade"
          ? ativacaoEm.toISOString()
          : agoraIso

    const atualizacaoLoja = {
      plano,
      premium: true,
      patrocinado:
        plano === "patrocinado",
      limite_lojas: Number(
        planoCatalogo.limite_lojas || 1
      ),
      plano_periodo: periodo,
      plano_inicio: planoInicio,
      plano_vencimento:
        novoVencimento.toISOString(),
      assinatura_status: "ativa",
      renovacao_automatica: false,
      cortesia_ate: null,
      aviso_7_dias: false,
      aviso_3_dias: false,
      aviso_1_dia: false,
      aviso_vencido: false,
    }

    /*
     * novo_vencimento foi fixado ao criar a
     * preferência. Repetições do webhook
     * reaplicam a mesma data e nunca somam
     * meses novamente.
     */
    const { error: lojaError } =
      await supabaseAdmin
        .from("lojas")
        .update(atualizacaoLoja)
        .eq("id", lojaId)

    if (lojaError) {
      console.error(
        "Erro ao atualizar loja:",
        lojaError
      )

      return NextResponse.json(
        {
          error:
            "Erro ao atualizar loja",
        },
        { status: 500 }
      )
    }

    const {
      data: pagamentoFinalizado,
      error: finalizarPagamentoError,
    } = await supabaseAdmin
      .from("pagamentos")
      .update({
        ...dadosFixosPagamento,
        status: "approved",
        mp_payment_id: paymentId,
        processado_em: processadoEm,
        ativado_em: processadoEm,
        updated_at: processadoEm,
      })
      .eq("id", pagamento.id)
      .is("processado_em", null)
      .select("id")
      .maybeSingle()

    if (finalizarPagamentoError) {
      console.error(
        "Erro ao finalizar pagamento:",
        finalizarPagamentoError
      )

      return NextResponse.json(
        {
          error:
            "Erro ao finalizar pagamento",
        },
        { status: 500 }
      )
    }

    if (!pagamentoFinalizado) {
      return NextResponse.json({
        recebido: true,
        duplicado: true,
        status: "approved",
        paymentId,
      })
    }

    const dataVencimentoFormatada =
      novoVencimento.toLocaleDateString(
        "pt-BR",
        {
          timeZone:
            "America/Sao_Paulo",
        }
      )

    const configuracaoMensagem: Record<
      Exclude<
        TipoMudanca,
        "downgrade"
      > | "downgrade",
      {
        evento: string
        titulo: string
        acao: string
      }
    > = {
      contratacao: {
        evento:
          "pagamento_aprovado",
        titulo:
          "Plano ativado",
        acao:
          "ativado",
      },
      renovacao: {
        evento:
          "renovacao_aprovada",
        titulo:
          "Plano renovado",
        acao:
          "renovado",
      },
      upgrade: {
        evento:
          "upgrade_aprovado",
        titulo:
          "Upgrade aprovado",
        acao:
          "ativado",
      },
      downgrade: {
        evento:
          "downgrade_ativado",
        titulo:
          "Mudança de plano concluída",
        acao:
          "ativado",
      },
    }

    const configuracao =
      configuracaoMensagem[
        tipoMudanca
      ]

    const mensagem =
      `Pagamento aprovado. Plano ${plano} ` +
      `${configuracao.acao} até ` +
      `${dataVencimentoFormatada}.`

    const resultadoRegistros =
      await Promise.allSettled([
        registrarHistorico({
          lojaId,
          evento:
            configuracao.evento,
          planoAnterior:
            planoAnteriorPagamento,
          planoNovo: plano,
          mensagem,
          usuarioId:
            lojaAtual.user_id || null,
          valor: valorEsperado,
          referencia: paymentId,
        }),

        criarNotificacao({
          lojaId,
          titulo:
            configuracao.titulo,
          mensagem:
            `Seu plano ${plano} foi ` +
            `${configuracao.acao} com sucesso ` +
            `e ficará válido até ` +
            `${dataVencimentoFormatada}.`,
          tipo: "pagamento",
          icone: "payment",
          link:
            `/lojista/loja/${lojaId}`,
        }),
      ])

    resultadoRegistros.forEach(
      (resultado, indice) => {
        if (
          resultado.status ===
          "rejected"
        ) {
          console.error(
            indice === 0
              ? "Erro ao registrar histórico:"
              : "Erro ao criar notificação:",
            resultado.reason
          )
        }
      }
    )

    return NextResponse.json({
      recebido: true,
      status: "approved",
      agendado: false,
      tipoMudanca,
      plano,
      periodo,
      meses,
      lojaId,
      paymentId,
      ativacao:
        ativacaoEm.toISOString(),
      vencimento:
        novoVencimento.toISOString(),
    })
  } catch (error: any) {
    console.error(
      "Erro no webhook Mercado Pago:",
      error?.message || error
    )

    return NextResponse.json(
      {
        error:
          "Erro no webhook",
        detalhes:
          error?.message ||
          "Erro desconhecido",
      },
      { status: 500 }
    )
  }
}