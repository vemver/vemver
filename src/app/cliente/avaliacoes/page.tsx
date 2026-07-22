"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../supabase"

export default function MinhasAvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [lojas, setLojas] = useState<Record<number, any>>({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarAvaliacoes()
  }, [])

  function criarSlugLoja(loja: any) {
    return `/loja/${loja.id}-${String(loja.nome || "")
      .toLowerCase()
      .replaceAll(" ", "-")}`
  }

  async function carregarAvaliacoes() {
    setCarregando(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    const { data, error } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if (error) {
      console.error("Erro ao carregar avaliações:", error)
      alert("Não foi possível carregar suas avaliações.")
      setCarregando(false)
      return
    }

    const listaAvaliacoes = data || []
    setAvaliacoes(listaAvaliacoes)

    const idsLojas = [
      ...new Set(
        listaAvaliacoes
          .map((item) => Number(item.loja_id))
          .filter(Boolean)
      ),
    ]

    if (idsLojas.length > 0) {
      const { data: lojasData, error: lojasError } = await supabase
        .from("lojas")
        .select("id, nome, imagem_url, categoria, cidade")
        .in("id", idsLojas)

      if (lojasError) {
        console.error("Erro ao carregar lojas:", lojasError)
      } else {
        const mapaLojas: Record<number, any> = {}

        ;(lojasData || []).forEach((loja) => {
          mapaLojas[Number(loja.id)] = loja
        })

        setLojas(mapaLojas)
      }
    }

    setCarregando(false)
  }

  async function excluirAvaliacao(avaliacaoId: number) {
    const confirmar = confirm(
      "Deseja realmente excluir esta avaliação?"
    )

    if (!confirmar) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    const { error } = await supabase
      .from("avaliacoes")
      .delete()
      .eq("id", avaliacaoId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Erro ao excluir avaliação:", error)
      alert("Não foi possível excluir a avaliação.")
      return
    }

    setAvaliacoes((listaAtual) =>
      listaAtual.filter(
        (avaliacao) => Number(avaliacao.id) !== Number(avaliacaoId)
      )
    )
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">
          Carregando avaliações...
        </h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <a
              href="/cliente"
              className="text-sm font-bold text-green-300"
            >
              ← Voltar para minha conta
            </a>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              Minhas avaliações ⭐
            </h1>

            <p className="mt-3 text-zinc-400">
              Veja e gerencie as avaliações que você publicou.
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
          >
            Explorar lojas
          </a>
        </header>

        {avaliacoes.length === 0 ? (
          <section className="mt-10 rounded-[2rem] border border-dashed border-white/20 bg-zinc-900 p-12 text-center">
            <div className="text-6xl">⭐</div>

            <h2 className="mt-5 text-3xl font-black">
              Nenhuma avaliação publicada
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Visite uma loja e compartilhe sua experiência com outros clientes.
            </p>

            <a
              href="/"
              className="mt-6 inline-block rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black"
            >
              Encontrar lojas
            </a>
          </section>
        ) : (
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            {avaliacoes.map((avaliacao) => {
              const loja = lojas[Number(avaliacao.loja_id)]

              return (
                <article
                  key={avaliacao.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900"
                >
                  {loja?.imagem_url && (
                    <img
                      src={loja.imagem_url}
                      alt={loja.nome}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-500">
                          Loja avaliada
                        </p>

                        <h2 className="mt-1 text-2xl font-black">
                          {loja?.nome || "Loja"}
                        </h2>

                        {loja && (
                          <p className="mt-1 text-sm text-zinc-500">
                            {loja.categoria} · 📍 {loja.cidade}
                          </p>
                        )}
                      </div>

                      <span className="rounded-full bg-yellow-400 px-4 py-2 font-black text-black">
                        ⭐ {avaliacao.nota}
                      </span>
                    </div>

                    {avaliacao.comentario && (
                      <p className="mt-5 rounded-2xl bg-black/40 p-4 text-zinc-300">
                        {avaliacao.comentario}
                      </p>
                    )}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {loja && (
                        <button
                          onClick={() =>
                            (window.location.href = criarSlugLoja(loja))
                          }
                          className="rounded-2xl bg-green-400 px-5 py-4 font-black text-black"
                        >
                          Ver loja e editar
                        </button>
                      )}

                      <button
                        onClick={() =>
                          excluirAvaliacao(Number(avaliacao.id))
                        }
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-bold text-red-300"
                      >
                        Excluir avaliação
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}