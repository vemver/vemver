"use client"

import type { PlanoCatalogo } from "./GerenciarPlanos"

type Props = {
  aberto: boolean
  plano: PlanoCatalogo | null
  processando: boolean

  onFechar: () => void
  onConfirmar: () => void
}

function formatarPreco(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function nomePeriodo(periodo: string) {
  if (periodo === "anual") return "Anual"
  if (periodo === "trimestral") return "Trimestral"

  return "Mensal"
}

export default function PlanoModal({
  aberto,
  plano,
  processando,
  onFechar,
  onConfirmar,
}: Props) {
  if (!aberto || !plano) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">

        <h2 className="text-3xl font-black">
          Confirmar assinatura
        </h2>

        <p className="mt-2 text-zinc-400">
          Confira os dados antes de continuar.
        </p>

        <div className="mt-8 space-y-5">

          <div className="rounded-2xl bg-black/30 p-5">

            <p className="text-sm text-zinc-500">
              Plano
            </p>

            <h3 className="mt-1 text-2xl font-black">
              {plano.nome}
            </h3>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-black/30 p-5">

              <p className="text-sm text-zinc-500">
                Período
              </p>

              <p className="mt-2 text-xl font-black">
                {nomePeriodo(plano.periodo)}
              </p>

            </div>

            <div className="rounded-2xl bg-black/30 p-5">

              <p className="text-sm text-zinc-500">
                Valor
              </p>

              <p className="mt-2 text-xl font-black text-green-300">
                {formatarPreco(plano.preco)}
              </p>

            </div>

          </div>

          <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-5">

            <p className="font-bold">
              Benefícios incluídos
            </p>

            <ul className="mt-3 space-y-2 text-sm text-zinc-300">

              <li>✔ Até {plano.limite_produtos} produtos</li>

              <li>✔ Até {plano.limite_lojas} loja(s)</li>

              <li>
                ✔ Até {plano.limite_imagens_produto} imagens por produto
              </li>

              {plano.permite_promocao && (
                <li>✔ Produtos em promoção</li>
              )}

              {plano.permite_destaque && (
                <li>✔ Produtos em destaque</li>
              )}

            </ul>

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onFechar}
            disabled={processando}
            className="rounded-2xl border border-white/10 px-6 py-3 font-bold"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirmar}
            disabled={processando}
            className="rounded-2xl bg-green-500 px-6 py-3 font-black text-white"
          >
            {processando
              ? "Processando..."
              : "Continuar para pagamento"}
          </button>

        </div>

      </div>
    </div>
  )
}