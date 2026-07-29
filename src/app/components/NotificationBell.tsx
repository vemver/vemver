"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

type Notificacao = {
  id: number
  loja_id: number
  titulo: string
  mensagem: string
  tipo: string | null
  lida: boolean
  icone: string | null
  link: string | null
  enviada_em: string | null
  created_at: string
}

type NotificationBellProps = {
  lojaId: number
}

export default function NotificationBell({
  lojaId,
}: NotificationBellProps) {
  const [notificacoes, setNotificacoes] = useState<
    Notificacao[]
  >([])

  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] =
    useState(true)

useEffect(() => {
  console.log("Loja recebida:", lojaId)

  carregarNotificacoes()
}, [lojaId])

  async function carregarNotificacoes() {
    try {
      setCarregando(true)

      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("loja_id", lojaId)
        .order("created_at", {
          ascending: false,
        })
        .limit(20)

      if (error) {
        console.error(
          "Erro ao carregar notificações:",
          error
        )
        return
      }

      setNotificacoes(data || [])
    } finally {
      setCarregando(false)
    }
  }

  async function marcarComoLida(
    notificacaoId: number
  ) {
    const { error } = await supabase
      .from("notificacoes")
      .update({
        lida: true,
      })
      .eq("id", notificacaoId)
      .eq("loja_id", lojaId)

    if (error) {
      console.error(
        "Erro ao marcar notificação como lida:",
        error
      )
      return
    }

    setNotificacoes((anteriores) =>
      anteriores.map((notificacao) =>
        notificacao.id === notificacaoId
          ? {
              ...notificacao,
              lida: true,
            }
          : notificacao
      )
    )
  }

  function abrirNotificacao(
    notificacao: Notificacao
  ) {
    if (!notificacao.lida) {
      marcarComoLida(notificacao.id)
    }

    if (notificacao.link) {
      window.location.href = notificacao.link
    }
  }

  const quantidadeNaoLidas =
    notificacoes.filter(
      (notificacao) => !notificacao.lida
    ).length

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setAberto((estadoAtual) => !estadoAtual)
        }
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-xl transition hover:bg-zinc-800"
        aria-label="Abrir notificações"
      >
        🔔

        {quantidadeNaoLidas > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
            {quantidadeNaoLidas > 99
              ? "99+"
              : quantidadeNaoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-white">
                Notificações
              </h2>

              <p className="text-xs text-zinc-500">
                {quantidadeNaoLidas} não lida(s)
              </p>
            </div>

            <button
              type="button"
              onClick={carregarNotificacoes}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5"
            >
              Atualizar
            </button>
          </div>

          <div className="max-h-[430px] overflow-y-auto">
            {carregando ? (
              <p className="p-6 text-center text-sm text-zinc-400">
                Carregando notificações...
              </p>
            ) : notificacoes.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-400">
                Nenhuma notificação encontrada.
              </p>
            ) : (
              notificacoes.map((notificacao) => (
                <button
                  key={notificacao.id}
                  type="button"
                  onClick={() =>
                    abrirNotificacao(notificacao)
                  }
                  className={`block w-full border-b border-white/5 px-5 py-4 text-left transition hover:bg-white/5 ${
                    notificacao.lida
                      ? "bg-transparent"
                      : "bg-green-500/5"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 text-xl">
                      {notificacao.icone ===
                      "payment"
                        ? "💳"
                        : notificacao.icone ===
                            "warning"
                          ? "⚠️"
                          : notificacao.icone ===
                              "gift"
                            ? "🎁"
                            : "🔔"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-black text-white">
                          {notificacao.titulo}
                        </h3>

                        {!notificacao.lida && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-green-400" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-3 text-sm leading-5 text-zinc-400">
                        {notificacao.mensagem}
                      </p>

                      <p className="mt-2 text-xs text-zinc-600">
                        {new Date(
                          notificacao.enviada_em ||
                            notificacao.created_at
                        ).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}