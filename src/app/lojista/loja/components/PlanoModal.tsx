"use client"

import type { PlanoCatalogo } from "./GerenciarPlanos"

export type SimulacaoPagamento = {
  simulacao: boolean
  tipo_mudanca:
    | "contratacao"
    | "renovacao"
    | "upgrade"
    | "downgrade"
  tipo_mudanca_nome: string
  plano_anterior: string
  periodo_anterior: string | null
  plano_novo: string
  periodo_novo: string
  meses: number
  valor_tabela: number
  credito_aplicado: number
  dias_restantes_credito: number
  valor_final: number
  ativacao_em: string
  novo_vencimento: string
}

type Props = {
  aberto: boolean
  plano: PlanoCatalogo | null
  processando: boolean
  carregandoSimulacao: boolean
  erroSimulacao: string | null
  simulacao: SimulacaoPagamento | null
  onFechar: () => void
  onConfirmar: () => void
}

function formatarPreco(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function nomePeriodo(periodo: string | null) {
  if (periodo === "anual") return "Anual"
  if (periodo === "trimestral") return "Trimestral"
  if (periodo === "mensal") return "Mensal"

  return "Não informado"
}

function nomePlano(plano: string) {
  const nomes: Record<string, string> = {
    gratis: "Grátis",
    premium: "Premium",
    patrocinado: "Patrocinado",
    multiunidade: "Multiunidade",
    franquia: "Franquia",
  }

  return nomes[plano] || plano
}

function formatarData(valor: string) {
  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível"
  }

  return data.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  })
}

function mensagemDaMudanca(
  simulacao: SimulacaoPagamento
) {
  if (simulacao.tipo_mudanca === "upgrade") {
    return {
      classe:
        "border-green-400/25 bg-green-400/10 text-green-200",
      texto:
        "O novo plano será ativado assim que o pagamento for aprovado. O período não utilizado do plano atual virou crédito.",
    }
  }

  if (simulacao.tipo_mudanca === "downgrade") {
    return {
      classe:
        "border-orange-400/25 bg-orange-400/10 text-orange-200",
      texto:
        "Seu plano atual continuará funcionando até o vencimento. O novo plano será ativado somente nessa data.",
    }
  }

  if (simulacao.tipo_mudanca === "renovacao") {
    return {
      classe:
        "border-blue-400/25 bg-blue-400/10 text-blue-200",
      texto:
        "O novo período será acrescentado depois dos dias que você já possui. Nenhum dia pago será perdido.",
    }
  }

  return {
    classe:
      "border-green-400/25 bg-green-400/10 text-green-200",
    texto:
      "O plano será ativado assim que o pagamento for aprovado.",
  }
}

export default function PlanoModal({
  aberto,
  plano,
  processando,
  carregandoSimulacao,
  erroSimulacao,
  simulacao,
  onFechar,
  onConfirmar,
}: Props) {
  if (!aberto || !plano) return null

  const mensagem = simulacao
    ? mensagemDaMudanca(simulacao)
    : null

  const confirmacaoBloqueada =
    processando ||
    carregandoSimulacao ||
    Boolean(erroSimulacao) ||
    !simulacao

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-6">
      <div className="my-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <h2 className="text-3xl font-black">
          Confirmar assinatura
        </h2>

        <p className="mt-2 text-zinc-400">
          Confira como a mudança será aplicada antes de continuar.
        </p>

        {carregandoSimulacao && (
          <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-6 text-center">
            <p className="font-black text-blue-200">
              Calculando sua assinatura...
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Estamos verificando o plano atual, o crédito e a data de ativação.
            </p>
          </div>
        )}

        {!carregandoSimulacao && erroSimulacao && (
          <div className="mt-8 rounded-2xl border border-red-400/25 bg-red-400/10 p-5">
            <p className="font-black text-red-200">
              Não foi possível calcular a mudança
            </p>

            <p className="mt-2 text-sm text-red-100/80">
              {erroSimulacao}
            </p>
          </div>
        )}

        {!carregandoSimulacao && simulacao && (
          <div className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-black/30 p-5">
                <p className="text-sm text-zinc-500">
                  Plano atual
                </p>

                <p className="mt-1 text-xl font-black">
                  {nomePlano(simulacao.plano_anterior)}
                </p>

                {simulacao.periodo_anterior && (
                  <p className="mt-1 text-sm text-zinc-400">
                    {nomePeriodo(
                      simulacao.periodo_anterior
                    )}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-5">
                <p className="text-sm text-green-200/70">
                  Novo plano
                </p>

                <p className="mt-1 text-xl font-black text-green-200">
                  {plano.nome}
                </p>

                <p className="mt-1 text-sm text-green-100/70">
                  {nomePeriodo(plano.periodo)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-black">
                  {simulacao.tipo_mudanca_nome}
                </p>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-zinc-300">
                  {simulacao.meses === 1
                    ? "1 mês"
                    : `${simulacao.meses} meses`}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 text-zinc-300">
                  <span>Valor da opção</span>
                  <strong>
                    {formatarPreco(
                      simulacao.valor_tabela
                    )}
                  </strong>
                </div>

                {simulacao.credito_aplicado > 0 && (
                  <div className="flex items-center justify-between gap-4 text-green-300">
                    <span>
                      Crédito do plano atual
                      {simulacao.dias_restantes_credito > 0
                        ? ` (${simulacao.dias_restantes_credito} dias)`
                        : ""}
                    </span>

                    <strong>
                      −{" "}
                      {formatarPreco(
                        simulacao.credito_aplicado
                      )}
                    </strong>
                  </div>
                )}

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-black">
                      Valor a pagar
                    </span>

                    <strong className="text-2xl text-green-300">
                      {formatarPreco(
                        simulacao.valor_final
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {mensagem && (
              <div
                className={`rounded-2xl border p-5 ${mensagem.classe}`}
              >
                <p className="text-sm leading-6">
                  {mensagem.texto}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-black/30 p-5">
                <p className="text-sm text-zinc-500">
                  Ativação
                </p>

                <p className="mt-2 font-black">
                  {formatarData(
                    simulacao.ativacao_em
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-black/30 p-5">
                <p className="text-sm text-zinc-500">
                  Novo vencimento
                </p>

                <p className="mt-2 font-black">
                  {formatarData(
                    simulacao.novo_vencimento
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-5">
              <p className="font-bold">
                Benefícios incluídos
              </p>

              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {plano.limite_produtos !== null && (
                  <li>
                    ✔ Até {plano.limite_produtos} produtos
                  </li>
                )}

                {plano.limite_lojas !== null && (
                  <li>
                    ✔ Até {plano.limite_lojas} loja(s)
                  </li>
                )}

                {plano.limite_imagens_produto !== null && (
                  <li>
                    ✔ Até{" "}
                    {plano.limite_imagens_produto} imagens por produto
                  </li>
                )}

                {plano.permite_promocao && (
                  <li>✔ Produtos em promoção</li>
                )}

                {plano.permite_destaque && (
                  <li>✔ Produtos em destaque</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onFechar}
            disabled={processando}
            className="rounded-2xl border border-white/10 px-6 py-3 font-bold transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmacaoBloqueada}
            className="rounded-2xl bg-green-500 px-6 py-3 font-black text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {processando
              ? "Processando..."
              : carregandoSimulacao
                ? "Calculando..."
                : "Continuar para pagamento"}
          </button>
        </div>
      </div>
    </div>
  )
}