"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../supabase"

export default function FavoritosPage() {
  const [carregando, setCarregando] = useState(true)
  const [lojasFavoritas, setLojasFavoritas] = useState<any[]>([])
  const [produtosFavoritos, setProdutosFavoritos] = useState<any[]>([])

  useEffect(() => {
    carregarFavoritos()
  }, [])

  function criarSlugLoja(loja: any) {
    return `/loja/${loja.id}-${String(loja.nome || "")
      .toLowerCase()
      .replaceAll(" ", "-")}`
  }

  async function carregarFavoritos() {
    setCarregando(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    const { data: favoritos, error } = await supabase
      .from("favoritos")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      alert("Erro ao carregar favoritos")
      setCarregando(false)
      return
    }

    const idsLojas = (favoritos || [])
      .filter((item) => item.loja_id)
      .map((item) => Number(item.loja_id))

    const idsProdutos = (favoritos || [])
      .filter((item) => item.produto_id)
      .map((item) => Number(item.produto_id))

    let lojas: any[] = []
    let produtos: any[] = []

    if (idsLojas.length > 0) {
      const { data: lojasData, error: lojasError } = await supabase
        .from("lojas")
        .select("*")
        .in("id", idsLojas)
        .eq("ativo", true)

      if (lojasError) {
        console.log(lojasError)
      } else {
        lojas = lojasData || []
      }
    }

    if (idsProdutos.length > 0) {
      const { data: produtosData, error: produtosError } = await supabase
        .from("produtos")
        .select("*")
        .in("id", idsProdutos)
        .eq("ativo", true)

      if (produtosError) {
        console.log(produtosError)
      } else {
        produtos = produtosData || []
      }
    }

    setLojasFavoritas(lojas)
    setProdutosFavoritos(produtos)
    setCarregando(false)
  }

  async function removerLoja(lojaId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    const confirmar = confirm(
      "Deseja remover esta loja dos seus favoritos?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("user_id", user.id)
      .eq("loja_id", lojaId)

    if (error) {
      console.log(error)
      alert("Erro ao remover favorito")
      return
    }

    setLojasFavoritas((listaAtual) =>
      listaAtual.filter((loja) => Number(loja.id) !== Number(lojaId))
    )
  }

  async function removerProduto(produtoId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    const confirmar = confirm(
      "Deseja remover este produto dos seus favoritos?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("user_id", user.id)
      .eq("produto_id", produtoId)

    if (error) {
      console.log(error)
      alert("Erro ao remover favorito")
      return
    }

    setProdutosFavoritos((listaAtual) =>
      listaAtual.filter(
        (produto) => Number(produto.id) !== Number(produtoId)
      )
    )
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">
          Carregando favoritos...
        </h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <a
              href="/cliente"
              className="text-sm font-bold text-green-300"
            >
              ← Voltar para minha conta
            </a>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              Meus favoritos ❤️
            </h1>

            <p className="mt-3 text-zinc-400">
              Suas lojas e produtos salvos no VemVer.
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
          >
            Explorar o VemVer
          </a>
        </header>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">
                Lojas favoritas
              </h2>

              <p className="mt-2 text-zinc-400">
                Empresas que você deseja acompanhar.
              </p>
            </div>

            <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300">
              {lojasFavoritas.length} loja(s)
            </span>
          </div>

          {lojasFavoritas.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/20 bg-zinc-900 p-10 text-center">
              <div className="text-5xl">🏪</div>

              <h3 className="mt-5 text-2xl font-black">
                Nenhuma loja favorita
              </h3>

              <p className="mt-3 text-zinc-400">
                Visite uma loja e clique no botão de favoritar.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lojasFavoritas.map((loja) => (
                <article
                  key={`favorita-loja-${loja.id}`}
                  className={`overflow-hidden rounded-3xl border bg-zinc-900 ${
                    loja.patrocinado
                      ? "border-blue-500"
                      : loja.premium
                      ? "border-yellow-400"
                      : "border-white/10"
                  }`}
                >
                  {loja.imagem_url ? (
                    <img
                      src={loja.imagem_url}
                      alt={loja.nome}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-zinc-800 text-zinc-500">
                      Loja sem imagem
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {loja.patrocinado && (
                        <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-black text-white">
                          🚀 PATROCINADO
                        </span>
                      )}

                      {!loja.patrocinado && loja.premium && (
                        <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                          ⭐ PREMIUM
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl font-black">
                      {loja.nome}
                    </h3>

                    <p className="mt-2 text-zinc-400">
                      {loja.categoria}
                    </p>

                    <p className="mt-1 text-zinc-500">
                      📍 {loja.cidade}
                    </p>

                    <div className="mt-6 grid gap-3">
                      <button
                        onClick={() =>
                          (window.location.href = criarSlugLoja(loja))
                        }
                        className="rounded-2xl bg-green-400 px-5 py-4 font-black text-black"
                      >
                        Ver loja
                      </button>

                      <button
                        onClick={() => removerLoja(loja.id)}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-bold text-red-300"
                      >
                        Remover dos favoritos
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">
                Produtos favoritos
              </h2>

              <p className="mt-2 text-zinc-400">
                Produtos e serviços que você deseja encontrar novamente.
              </p>
            </div>

            <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300">
              {produtosFavoritos.length} produto(s)
            </span>
          </div>

          {produtosFavoritos.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/20 bg-zinc-900 p-10 text-center">
              <div className="text-5xl">🛍️</div>

              <h3 className="mt-5 text-2xl font-black">
                Nenhum produto favorito
              </h3>

              <p className="mt-3 text-zinc-400">
                Em breve você poderá salvar produtos diretamente nos cards.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {produtosFavoritos.map((produto) => (
                <article
                  key={`favorito-produto-${produto.id}`}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900"
                >
                  {produto.imagem_url ? (
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-zinc-800 text-zinc-500">
                      Produto sem imagem
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-xl font-black">
                      {produto.nome}
                    </h3>

                    {produto.preco && (
                      <p className="mt-2 text-2xl font-black text-green-300">
                        R$ {Number(produto.preco)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    )}

                    {produto.descricao && (
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                        {produto.descricao}
                      </p>
                    )}

                    <button
                      onClick={() => removerProduto(produto.id)}
                      className="mt-5 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-bold text-red-300"
                    >
                      Remover dos favoritos
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}