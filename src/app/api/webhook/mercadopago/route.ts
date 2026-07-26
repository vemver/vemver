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
  "https://bwyqesogduegtoookdhu.supabase.co"

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const mercadoPagoToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN || ""

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
)

const mpClient = new MercadoPagoConfig({
  accessToken: mercadoPagoToken,
})

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
          error: "Configuração incompleta",
        },
        {
          status: 500,
        }
      )
    }

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
      body?.resource?.split("/")?.pop() ||
      body?.id

    if (!eventoId) {
      return NextResponse.json({
        recebido: true,
        motivo: "Notificação sem ID",
      })
    }

    let paymentId = String(eventoId)
    let merchantPreferenceId = ""
    let merchantLojaId = ""

    const ehMerchantOrder = String(topic || "")
      .toLowerCase()
      .includes("merchant_order")

    if (ehMerchantOrder) {
      const merchantOrder =
        new MerchantOrder(mpClient)

      const merchantOrderData: any =
        await merchantOrder.get({
          merchantOrderId: String(eventoId),
        })

      merchantPreferenceId = String(
        merchantOrderData.preference_id || ""
      )

      merchantLojaId = String(
        merchantOrderData.external_reference || ""
      )

      const pagamentoAprovado =
        merchantOrderData.payments?.find(
          (pagamento: any) =>
            pagamento.status === "approved"
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
        motivo: "Pagamento não encontrado",
      })
    }

    const status = String(
      paymentData.status || ""
    )

    const preferenceId = String(
      paymentData.preference_id ||
        merchantPreferenceId ||
        ""
    )

    const lojaId = String(
      paymentData.metadata?.loja_id ||
        paymentData.external_reference ||
        merchantLojaId ||
        ""
    )

    if (!preferenceId || !lojaId) {
      return NextResponse.json({
        recebido: true,
        motivo: "Sem preferenceId ou lojaId",
      })
    }

    const {
      data: pagamento,
      error: pagamentoError,
    } = await supabaseAdmin
      .from("pagamentos")
      .select("*")
      .eq("mp_preference_id", preferenceId)
      .maybeSingle()

    if (pagamentoError) {
      console.error(
        "Erro ao localizar pagamento:",
        pagamentoError
      )

      return NextResponse.json(
        {
          error: "Erro ao consultar pagamento",
        },
        {
          status: 500,
        }
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

    /*
     * Evita criar histórico e notificações duplicadas.
     * O Mercado Pago pode enviar o mesmo webhook
     * várias vezes.
     */
    const pagamentoJaProcessado =
      pagamento.status === "approved" &&
      String(pagamento.mp_payment_id || "") ===
        paymentId

    if (pagamentoJaProcessado) {
      return NextResponse.json({
        recebido: true,
        duplicado: true,
        status,
        paymentId,
      })
    }

    const { error: updatePagamentoError } =
      await supabaseAdmin
        .from("pagamentos")
        .update({
          status,
          mp_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pagamento.id)

    if (updatePagamentoError) {
      console.error(
        "Erro ao atualizar pagamento:",
        updatePagamentoError
      )

      return NextResponse.json(
        {
          error: "Erro ao atualizar pagamento",
        },
        {
          status: 500,
        }
      )
    }

    if (status !== "approved") {
      return NextResponse.json({
        recebido: true,
        status,
      })
    }

    const plano = String(pagamento.plano || "")

    const configuracoesPlano: Record<
      string,
      {
        plano: string
        premium: boolean
        patrocinado: boolean
        limite_lojas: number
      }
    > = {
      premium: {
        plano: "premium",
        premium: true,
        patrocinado: false,
        limite_lojas: 1,
      },

      patrocinado: {
        plano: "patrocinado",
        premium: true,
        patrocinado: true,
        limite_lojas: 1,
      },

      multiunidade: {
        plano: "multiunidade",
        premium: true,
        patrocinado: false,
        limite_lojas: 5,
      },
    }

    const atualizacaoLoja =
      configuracoesPlano[plano]

    if (!atualizacaoLoja) {
      return NextResponse.json({
        recebido: true,
        status,
        motivo: "Plano não reconhecido",
      })
    }

    /*
     * Busca os dados atuais da loja antes da alteração.
     * Assim conseguimos registrar o plano anterior
     * no histórico.
     */
    const {
      data: lojaAtual,
      error: buscarLojaError,
    } = await supabaseAdmin
      .from("lojas")
      .select("id, nome, plano, user_id")
      .eq("id", Number(lojaId))
      .maybeSingle()

    if (buscarLojaError) {
      console.error(
        "Erro ao buscar loja:",
        buscarLojaError
      )

      return NextResponse.json(
        {
          error: "Erro ao localizar loja",
        },
        {
          status: 500,
        }
      )
    }

    if (!lojaAtual) {
      return NextResponse.json(
        {
          error: "Loja não encontrada",
        },
        {
          status: 404,
        }
      )
    }

    const periodoRecebido = String(
      pagamento.periodo || "mensal"
    ).toLowerCase()

    const periodo =
      periodoRecebido === "trimestral" ||
      periodoRecebido === "anual"
        ? periodoRecebido
        : "mensal"

    const agora = new Date()
    const vencimento = new Date(agora)

    switch (periodo) {
      case "trimestral":
        vencimento.setMonth(
          vencimento.getMonth() + 3
        )
        break

      case "anual":
        vencimento.setFullYear(
          vencimento.getFullYear() + 1
        )
        break

      default:
        vencimento.setMonth(
          vencimento.getMonth() + 1
        )
        break
    }

    const { error: lojaError } =
      await supabaseAdmin
        .from("lojas")
        .update({
          ...atualizacaoLoja,

          plano_periodo: periodo,
          plano_inicio: agora.toISOString(),
          plano_vencimento:
            vencimento.toISOString(),

          assinatura_status: "ativa",
          renovacao_automatica: false,

          cortesia_ate: null,

          aviso_7_dias: false,
          aviso_3_dias: false,
          aviso_1_dia: false,
          aviso_vencido: false,
        })
        .eq("id", Number(lojaId))

    if (lojaError) {
      console.error(
        "Erro ao atualizar loja:",
        lojaError
      )

      return NextResponse.json(
        {
          error: "Erro ao atualizar loja",
        },
        {
          status: 500,
        }
      )
    }

    /*
     * Registra o histórico e cria a notificação.
     * Se uma dessas operações falhar, o plano já
     * continuará ativado normalmente.
     */
    const valorPagamento = Number(
      pagamento.valor ||
        paymentData.transaction_amount ||
        0
    )

    const resultadoRegistros =
      await Promise.allSettled([
        registrarHistorico({
          lojaId: Number(lojaId),
          evento: "pagamento_aprovado",
          planoAnterior:
            lojaAtual.plano || "gratis",
          planoNovo: plano,
          mensagem:
            `Pagamento aprovado. Plano ${plano} ativado com sucesso.`,
          usuarioId:
            lojaAtual.user_id || null,
          valor: valorPagamento,
          referencia: paymentId,
        }),

        criarNotificacao({
          lojaId: Number(lojaId),
          titulo: "Pagamento aprovado",
          mensagem:
            `Seu plano ${plano} foi ativado com sucesso e ficará válido até ${vencimento.toLocaleDateString(
              "pt-BR"
            )}.`,
          tipo: "pagamento",
          icone: "payment",
          link: `/lojista/loja/${lojaId}`,
        }),
      ])

    resultadoRegistros.forEach(
      (resultado, indice) => {
        if (resultado.status === "rejected") {
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
      status,
      plano,
      periodo,
      lojaId,
      paymentId,
      vencimento: vencimento.toISOString(),
    })
  } catch (error: any) {
    console.error(
      "Erro no webhook Mercado Pago:",
      error?.message || error
    )

    return NextResponse.json(
      {
        error: "Erro no webhook",
        detalhes:
          error?.message ||
          "Erro desconhecido",
      },
      {
        status: 500,
      }
    )
  }
}