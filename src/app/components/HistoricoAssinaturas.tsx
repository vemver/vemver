"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

type Historico = {
  id: number
  loja_id: number
  evento: string
  plano_anterior: string | null
  plano_novo: string | null
  mensagem: string | null
  usuario_id: string | null
  valor: number | null
  referencia: string | null
  created_at: string
}

type HistoricoAssinaturasProps = {
  lojaId: number
}

export default function HistoricoAssinaturas({
  lojaId,
}: HistoricoAssinaturasProps) {
  const [historico, setHistorico] = useState<Historico[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarHistorico()
  }, [lojaId])

  async function carregarHistorico() {
    try {
      setCarregando(true)

      const { data, error } = await supabase
        .from("historico_assinaturas")
        .select("*")
        .eq("loja_id", lojaId)
        .order("created_at", {
          ascending: false,
        })
        .limit(50)

      if (error) {
        console.error(
          "Erro ao carregar histórico:",
          error
        )
        return
      }

      setHistorico(data || [])
    } finally {
      setCarregando(false)
    }
  }

  function formatarEvento(evento: string) {
    const nomes: Record<string, string> = {
      pagamento_aprovado: "Pagamento aprovado",
      aviso_7_dias: "Aviso de vencimento em 7 dias",
      aviso_3_dias: "Aviso de vencimento em 3 dias",
      aviso_1_dias: "Aviso de vencimento em 1 dia",
      inicio_cortesia: "Início da cortesia",
      fim_cortesia: "Fim da cortesia",
    }

    return nomes[evento] || evento.replaceAll("_", " ")
  }

  function escolherIcone(evento: string) {
    if (evento.includes("pagamento")) return "💳"
    if (evento.includes("aviso")) return "⚠️"
    if (evento.includes("cortesia")) return "🎁"
    return "📌"
  }

  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">
            Histórico da assinatura
          </h2>

          <p className="mt-2 text-zinc-400">
            Acompanhe pagamentos, avisos, renovações e alterações do plano.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarHistorico}
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-white/5"
        >
          Atualizar
        </button>
      </div>

      <div className="mt-6">
        {carregando ? (
          <p className="rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center text-zinc-400">
            Carregando histórico...
          </p>
        ) : historico.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center text-zinc-400">
            Nenhum evento registrado para esta loja.
          </p>
        ) : (
          <div className="space-y-3">
            {historico.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
              >
                <div className="flex gap-4">
                  <div className="text-2xl">
                    {escolherIcone(item.evento)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-black text-white">
                        {formatarEvento(item.evento)}
                      </h3>

                      <span className="text-xs text-zinc-500">
                        {new Date(
                          item.created_at
                        ).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    {item.mensagem && (
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {item.mensagem}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {item.plano_anterior && (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-zinc-400">
                          Anterior: {item.plano_anterior}
                        </span>
                      )}

                      {item.plano_novo && (
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-300">
                          Novo: {item.plano_novo}
                        </span>
                      )}

                      {item.valor !== null &&
                        item.valor !== undefined && (
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">
                            R${" "}
                            {Number(item.valor)
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}