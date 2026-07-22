"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../supabase"
import GaleriaProduto from "./components/GaleriaProduto"
export default function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [produto, setProduto] = useState<any | null>(null)
const [loja, setLoja] = useState<any | null>(null)
const [imagensProduto, setImagensProduto] = useState<any[]>([])
const [produtosRelacionados, setProdutosRelacionados] = useState<any[]>([])
const [carregando, setCarregando] = useState(true)
  useEffect(() => {
    async function iniciar() {
      const dados = await params
      const idProduto = Number(dados.slug.split("-")[0])

      if (!idProduto) {
        setCarregando(false)
        return
      }

      await carregarProduto(idProduto)
    }

    iniciar()
  }, [params])

  function formatarPreco(valor: number | string | null) {
    if (valor === null || valor === undefined) return ""

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function criarSlugProduto(item: any) {
    const nome = String(item.nome || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    return `/produto/${item.id}-${nome}`
  }

  function criarSlugLoja(item: any) {
    return `/loja/${item.id}-${String(item.nome || "")
      .toLowerCase()
      .replaceAll(" ", "-")}`
  }
async function registrarVisualizacaoProduto(produtoAtual: any) {
  if (!produtoAtual?.id) return

  const chaveVisualizacao = `vemver-produto-visto-${produtoAtual.id}`
  const ultimaVisualizacao = localStorage.getItem(chaveVisualizacao)

  const agora = Date.now()
  const intervaloMinimo = 30 * 60 * 1000

  if (ultimaVisualizacao) {
    const tempoDecorrido =
      agora - Number(ultimaVisualizacao)

    if (tempoDecorrido < intervaloMinimo) {
      return
    }
  }

  const novoTotal =
    Number(produtoAtual.visualizacoes || 0) + 1

  const { error } = await supabase
    .from("produtos")
    .update({
      visualizacoes: novoTotal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", produtoAtual.id)

  if (error) {
    console.error(
      "Erro ao registrar visualização do produto:",
      error
    )
    return
  }

  localStorage.setItem(
    chaveVisualizacao,
    String(agora)
  )

  setProduto((produtoAnterior: any) => {
    if (!produtoAnterior) return produtoAnterior

    return {
      ...produtoAnterior,
      visualizacoes: novoTotal,
    }
  })
}
  async function carregarProduto(idProduto: number) {
    setCarregando(true)

    const { data: produtoData, error: produtoError } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", idProduto)
      .eq("ativo", true)
      .maybeSingle()

    if (produtoError) {
      console.error("Erro ao carregar produto:", produtoError)
      setCarregando(false)
      return
    }

    if (!produtoData) {
      setCarregando(false)
      return
    }

    setProduto(produtoData)
    await registrarVisualizacaoProduto(produtoData)
const { data: imagensData, error: imagensError } = await supabase
  .from("produto_imagens")
  .select("*")
  .eq("produto_id", idProduto)
  .order("principal", { ascending: false })
  .order("ordem", { ascending: true })
  .order("id", { ascending: true })

if (imagensError) {
  console.error("Erro ao carregar imagens do produto:", imagensError)
  setImagensProduto([])
} else {
  setImagensProduto(imagensData || [])
}
    const { data: lojaData, error: lojaError } = await supabase
      .from("lojas")
      .select("*")
      .eq("id", Number(produtoData.loja_id))
      .eq("status", "aprovada")
      .maybeSingle()

    if (lojaError) {
      console.error("Erro ao carregar loja:", lojaError)
    } else {
      setLoja(lojaData)
    }

    const { data: relacionadosData, error: relacionadosError } =
      await supabase
        .from("produtos")
        .select("*")
        .eq("loja_id", Number(produtoData.loja_id))
        .eq("ativo", true)
        .neq("id", idProduto)
        .limit(4)

    if (relacionadosError) {
      console.error(
        "Erro ao carregar produtos relacionados:",
        relacionadosError
      )
    } else {
      setProdutosRelacionados(relacionadosData || [])
    }

    setCarregando(false)
  }

  async function abrirWhatsApp() {
  if (!loja?.whatsapp || !produto) return

  const novoTotalCliques =
    Number(produto.cliques_whatsapp || 0) + 1

  const { error } = await supabase
    .from("produtos")
    .update({
      cliques_whatsapp: novoTotalCliques,
      updated_at: new Date().toISOString(),
    })
    .eq("id", produto.id)

  if (error) {
    console.error(
      "Erro ao registrar clique no WhatsApp:",
      error
    )
  } else {
    setProduto((produtoAnterior: any) => {
      if (!produtoAnterior) return produtoAnterior

      return {
        ...produtoAnterior,
        cliques_whatsapp: novoTotalCliques,
      }
    })
  }

  const mensagem = encodeURIComponent(
    `Olá! Vi no VemVer e tenho interesse no produto: ${produto.nome}.`
  )

  const whatsappLimpo = String(loja.whatsapp)
    .replace(/\D/g, "")
    .replace(/^55/, "")

  window.open(
    `https://wa.me/55${whatsappLimpo}?text=${mensagem}`,
    "_blank"
  )
}

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">Carregando produto...</h1>
      </main>
    )
  }

  if (!produto) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <div className="text-6xl">📦</div>

        <h1 className="mt-5 text-4xl font-black">
          Produto não encontrado
        </h1>

        <p className="mt-3 text-zinc-400">
          Este produto pode ter sido removido ou desativado.
        </p>

        <a
          href="/"
          className="mt-6 rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
        >
          Voltar para o VemVer
        </a>
      </main>
    )
  }

  const precoNormal = Number(produto.preco || 0)
  const precoPromocional = Number(produto.preco_promocional || 0)

  const temPromocao =
    produto.promocao === true &&
    precoPromocional > 0 &&
    precoPromocional < precoNormal

  const economia = temPromocao
    ? precoNormal - precoPromocional
    : 0

  const descontoPercentual =
    temPromocao && precoNormal > 0
      ? Math.round((economia / precoNormal) * 100)
      : 0

  const indisponivel =
    produto.disponivel === false ||
    Number(produto.estoque || 0) === 0

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <a
            href="/"
            className="text-sm font-bold text-green-300"
          >
            ← Voltar para o VemVer
          </a>

          {loja && (
            <button
              type="button"
              onClick={() =>
                (window.location.href = criarSlugLoja(loja))
              }
              className="rounded-2xl border border-white/20 px-5 py-3 font-bold transition hover:border-green-400/50"
            >
              Ver loja
            </button>
          )}
        </header>

        <section className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
  <GaleriaProduto
    imagens={imagensProduto}
    imagemFallback={produto.imagem_url}
    nomeProduto={produto.nome}
  />
</div>
          <div>
            <div className="flex flex-wrap gap-2">
              {temPromocao && (
                <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white">
                  🔥 PROMOÇÃO
                </span>
              )}

              {produto.destaque && (
                <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-black">
                  ⭐ DESTAQUE
                </span>
              )}

              {indisponivel ? (
                <span className="rounded-full bg-zinc-700 px-4 py-2 text-sm font-black text-white">
                  INDISPONÍVEL
                </span>
              ) : (
                <span className="rounded-full bg-green-400 px-4 py-2 text-sm font-black text-black">
                  DISPONÍVEL
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              {produto.nome}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-zinc-400">
              {produto.categoria && <span>{produto.categoria}</span>}

              {produto.marca && (
                <>
                  <span>•</span>
                  <span>{produto.marca}</span>
                </>
              )}
            </div>

            {temPromocao ? (
              <div className="mt-8">
                <p className="text-lg text-zinc-500 line-through">
                  {formatarPreco(precoNormal)}
                </p>

                <p className="mt-1 text-5xl font-black text-green-300">
                  {formatarPreco(precoPromocional)}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="rounded-full bg-green-400/10 px-4 py-2 font-bold text-green-300">
                    Economize {formatarPreco(economia)}
                  </span>

                  <span className="rounded-full bg-red-500/10 px-4 py-2 font-black text-red-300">
                    {descontoPercentual}% OFF
                  </span>
                </div>
              </div>
            ) : produto.preco ? (
              <p className="mt-8 text-5xl font-black text-green-300">
                {formatarPreco(precoNormal)}
              </p>
            ) : (
              <p className="mt-8 text-2xl font-black text-zinc-300">
                Consulte o preço
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
                <p className="text-sm text-zinc-500">
                  Estoque informado
                </p>

                <p className="mt-2 text-2xl font-black">
                  {produto.estoque || 0} unidade(s)
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
                <p className="text-sm text-zinc-500">
                  Visualizações
                </p>

                <p className="mt-2 text-2xl font-black">
                  {produto.visualizacoes || 0}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirWhatsApp}
              disabled={!loja?.whatsapp || indisponivel}
              className="mt-8 w-full rounded-2xl bg-green-400 px-6 py-5 text-xl font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {indisponivel
                ? "Produto indisponível"
                : "Tenho interesse pelo WhatsApp"}
            </button>

            {produto.descricao && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
                <h2 className="text-2xl font-black">
                  Descrição do produto
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-zinc-300">
                  {produto.descricao}
                </p>
              </div>
            )}

            {loja && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
                <p className="text-sm text-zinc-500">Vendido por</p>

                <h2 className="mt-1 text-2xl font-black">
                  {loja.nome}
                </h2>

                <p className="mt-2 text-zinc-400">
                  {loja.categoria} · 📍 {loja.cidade}
                </p>

                {loja.descricao && (
                  <p className="mt-4 line-clamp-3 text-zinc-400">
                    {loja.descricao}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = criarSlugLoja(loja))
                  }
                  className="mt-5 rounded-2xl border border-white/20 px-5 py-3 font-bold transition hover:border-green-400/50"
                >
                  Conhecer a loja
                </button>
              </div>
            )}
          </div>
        </section>

        {produtosRelacionados.length > 0 && (
          <section className="mt-20">
            <h2 className="text-4xl font-black">
              Mais produtos desta loja
            </h2>

            <p className="mt-2 text-zinc-400">
              Veja outras opções oferecidas pelo mesmo vendedor.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {produtosRelacionados.map((item) => {
                const precoItem = Number(item.preco || 0)
                const precoPromocionalItem = Number(
                  item.preco_promocional || 0
                )

                const promocaoItem =
                  item.promocao === true &&
                  precoPromocionalItem > 0 &&
                  precoPromocionalItem < precoItem

                return (
                  <article
                    key={item.id}
                    onClick={() =>
                      (window.location.href = criarSlugProduto(item))
                    }
                    className="cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 transition hover:-translate-y-1 hover:border-green-400/40"
                  >
                    {item.imagem_url ? (
                      <img
                        src={item.imagem_url}
                        alt={item.nome}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-zinc-800 text-zinc-500">
                        Sem imagem
                      </div>
                    )}

                    <div className="p-5">
                      {promocaoItem && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                          🔥 PROMOÇÃO
                        </span>
                      )}

                      <h3 className="mt-4 text-xl font-black">
                        {item.nome}
                      </h3>

                      {promocaoItem ? (
                        <>
                          <p className="mt-3 text-sm text-zinc-500 line-through">
                            {formatarPreco(precoItem)}
                          </p>

                          <p className="text-2xl font-black text-green-300">
                            {formatarPreco(precoPromocionalItem)}
                          </p>
                        </>
                      ) : item.preco ? (
                        <p className="mt-3 text-2xl font-black text-green-300">
                          {formatarPreco(precoItem)}
                        </p>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}