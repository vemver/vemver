"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../supabase"
import GaleriaProduto from "./components/GaleriaProduto"
import GerenciarPlanos from "../components/GerenciarPlanos"
type PlanoCatalogo = {
  id: number
  codigo: string
  nome: string
  periodo: "mensal" | "trimestral" | "anual"
  meses: number
  preco: number
 limite_lojas: number | null
limite_produtos: number | null
limite_imagens_produto: number | null
  permite_promocao: boolean
  permite_destaque: boolean
  prioridade_busca: number
  estatisticas_nivel: string
  ativo: boolean
}
export default function LojaGerenciarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [carregando, setCarregando] = useState(true)
  const [userId, setUserId] = useState("")
  const [lojaId, setLojaId] = useState("")
  const [loja, setLoja] = useState<any | null>(null)
  const [produtos, setProdutos] = useState<any[]>([])
const [planosCatalogo, setPlanosCatalogo] = useState<PlanoCatalogo[]>([])
const [carregandoPlanos, setCarregandoPlanos] = useState(true)
const [processandoPagamento, setProcessandoPagamento] = useState(false)
  const [produtoNome, setProdutoNome] = useState("")
  const [produtoDescricao, setProdutoDescricao] = useState("")
  const [produtoCategoria, setProdutoCategoria] = useState("")
  const [produtoMarca, setProdutoMarca] = useState("")
  const [produtoPreco, setProdutoPreco] = useState("")
  const [produtoPrecoPromocional, setProdutoPrecoPromocional] =
    useState("")
  const [produtoEstoque, setProdutoEstoque] = useState("0")
  const [produtoDisponivel, setProdutoDisponivel] = useState(true)
  const [produtoPromocao, setProdutoPromocao] = useState(false)
  const [produtoImagem, setProdutoImagem] = useState<File | null>(null)
  const [produtoEditando, setProdutoEditando] = useState<any | null>(
    null
  )
  const [uploadingProduto, setUploadingProduto] = useState(false)
  const [salvandoProduto, setSalvandoProduto] = useState(false)

  useEffect(() => {
    async function iniciar() {
      const dados = await params
      setLojaId(dados.id)
      await carregarTudo(dados.id)
    }

    iniciar()
  }, [params])

  function converterNumero(valor: string) {
    if (!valor.trim()) return null

    const numero = Number(
      valor
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    )

    return Number.isFinite(numero) ? numero : null
  }

  function criarSlug(texto: string) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  async function carregarTudo(idLoja: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    setUserId(user.id)
console.log("ID recebido:", idLoja)
console.log("ID convertido:", Number(idLoja))
console.log("Usuário:", user.id)
    const { data: lojaData, error: lojaError } = await supabase
      .from("lojas")
      .select("*")
      .eq("id", Number(idLoja))
      .eq("user_id", user.id)
      .single()

    if (lojaError || !lojaData) {
      alert("Loja não encontrada ou sem permissão.")
      window.location.href = "/lojista"
      return
    }

   setLoja(lojaData)

await Promise.all([
  carregarProdutos(user.id, idLoja),
  carregarPlanosCatalogo(),
])

setCarregando(false)
  }

  async function carregarProdutos(
    idUsuario: string,
    idLoja: string
  ) {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("loja_id", Number(idLoja))
      .eq("user_id", idUsuario)
      .order("id", { ascending: false })

    if (error) {
      console.error("Erro ao carregar produtos:", error)
      return
    }

    setProdutos(data || [])
  }
async function carregarPlanosCatalogo() {
  setCarregandoPlanos(true)

  const { data, error } = await supabase
    .from("planos_catalogo")
    .select("*")
    .eq("ativo", true)
    .order("codigo", { ascending: true })
    .order("meses", { ascending: true })

  if (error) {
    console.error("Erro ao carregar os planos:", error)
    setPlanosCatalogo([])
    setCarregandoPlanos(false)
    return
  }

  setPlanosCatalogo((data || []) as PlanoCatalogo[])
  console.log(data)
  setCarregandoPlanos(false)
}
  async function enviarImagemProduto() {
    if (!produtoImagem) return ""

    setUploadingProduto(true)

    const nomeSeguro = produtoImagem.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    )

    const nomeArquivo = `produtos/${Date.now()}-${nomeSeguro}`

    const { error: uploadError } = await supabase.storage
      .from("lojas")
      .upload(nomeArquivo, produtoImagem)

    if (uploadError) {
      setUploadingProduto(false)
      console.error("Erro ao enviar imagem:", uploadError)
      alert("Erro ao enviar imagem do produto.")
      return ""
    }

    const { data } = supabase.storage
      .from("lojas")
      .getPublicUrl(nomeArquivo)

    setUploadingProduto(false)
    return data.publicUrl
  }

  function limparProduto() {
    setProdutoNome("")
    setProdutoDescricao("")
    setProdutoCategoria("")
    setProdutoMarca("")
    setProdutoPreco("")
    setProdutoPrecoPromocional("")
    setProdutoEstoque("0")
    setProdutoDisponivel(true)
    setProdutoPromocao(false)
    setProdutoImagem(null)
    setProdutoEditando(null)
  }

  function editarProduto(produto: any) {
    setProdutoEditando(produto)
    setProdutoNome(produto.nome || "")
    setProdutoDescricao(produto.descricao || "")
    setProdutoCategoria(produto.categoria || "")
    setProdutoMarca(produto.marca || "")
    setProdutoPreco(
      produto.preco !== null && produto.preco !== undefined
        ? String(produto.preco).replace(".", ",")
        : ""
    )
    setProdutoPrecoPromocional(
      produto.preco_promocional !== null &&
        produto.preco_promocional !== undefined
        ? String(produto.preco_promocional).replace(".", ",")
        : ""
    )
    setProdutoEstoque(String(produto.estoque ?? 0))
    setProdutoDisponivel(produto.disponivel !== false)
    setProdutoPromocao(produto.promocao === true)
    setProdutoImagem(null)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }
function atualizarImagemPrincipalProduto(
  produtoId: number,
  imagemUrl: string
) {
  setProdutos((listaAtual) =>
    listaAtual.map((produto) =>
      Number(produto.id) === Number(produtoId)
        ? {
            ...produto,
            imagem_url: imagemUrl || null,
          }
        : produto
    )
  )

  setProdutoEditando((produtoAtual: any) => {
    if (
      !produtoAtual ||
      Number(produtoAtual.id) !== Number(produtoId)
    ) {
      return produtoAtual
    }

    return {
      ...produtoAtual,
      imagem_url: imagemUrl || null,
    }
  })
}
  async function salvarProduto() {
    if (salvandoProduto || uploadingProduto) return

    if (!produtoNome.trim()) {
      alert("Digite o nome do produto.")
      return
    }

    if (!produtoCategoria.trim()) {
      alert("Informe a categoria do produto.")
      return
    }

    const precoFormatado = converterNumero(produtoPreco)
    const precoPromocionalFormatado = converterNumero(
      produtoPrecoPromocional
    )

    if (produtoPreco && precoFormatado === null) {
      alert("Informe um preço válido.")
      return
    }

    if (
      produtoPromocao &&
      precoPromocionalFormatado === null
    ) {
      alert("Informe o preço promocional.")
      return
    }

    if (
      precoFormatado !== null &&
      precoPromocionalFormatado !== null &&
      precoPromocionalFormatado >= precoFormatado
    ) {
      alert(
        "O preço promocional deve ser menor que o preço normal."
      )
      return
    }

    const estoqueFormatado = Math.max(
      0,
      Number.parseInt(produtoEstoque || "0", 10) || 0
    )

    setSalvandoProduto(true)

    const novaImagemUrl = await enviarImagemProduto()

    if (produtoImagem && !novaImagemUrl) {
      setSalvandoProduto(false)
      return
    }

    const textoCompleto =
      `${produtoNome} ${produtoDescricao} ${produtoMarca}`.toLowerCase()

    const palavrasProibidas = [
      "maconha",
      "cocaina",
      "cocaína",
      "crack",
      "arma",
      "revólver",
      "revolver",
      "pistola",
      "fuzil",
      "munição",
      "municao",
      "droga",
      "tráfico",
      "trafico",
      "cnh falsa",
      "rg falso",
      "documento falso",
    ]

    const bloqueado = palavrasProibidas.some((palavra) =>
      textoCompleto.includes(palavra)
    )

    const dadosProduto = {
      nome: produtoNome.trim(),
      descricao: produtoDescricao.trim(),
      categoria: produtoCategoria.trim(),
      marca: produtoMarca.trim() || null,
      preco: precoFormatado,
      preco_promocional: produtoPromocao
        ? precoPromocionalFormatado
        : null,
      estoque: estoqueFormatado,
      disponivel:
        produtoDisponivel && estoqueFormatado > 0,
      promocao:
        produtoPromocao &&
        precoPromocionalFormatado !== null,
      slug: criarSlug(
        `${produtoNome}-${lojaId}-${Date.now()}`
      ),
      updated_at: new Date().toISOString(),
    }

    if (produtoEditando) {
      const { error } = await supabase
        .from("produtos")
        .update({
          ...dadosProduto,
          imagem_url:
            novaImagemUrl || produtoEditando.imagem_url,
          ativo: bloqueado
            ? false
            : produtoEditando.ativo,
          status: bloqueado
            ? "bloqueado"
            : produtoEditando.status || "aprovado",
          slug:
            produtoEditando.slug ||
            criarSlug(
              `${produtoNome}-${produtoEditando.id}`
            ),
        })
        .eq("id", produtoEditando.id)
        .eq("user_id", userId)

      setSalvandoProduto(false)

      if (error) {
        console.error("Erro ao atualizar produto:", error)
        alert("Erro ao atualizar produto.")
        return
      }

      alert("Produto atualizado com sucesso!")
    } else {
      const { error } = await supabase
        .from("produtos")
        .insert([
          {
            ...dadosProduto,
            loja_id: Number(lojaId),
            user_id: userId,
            imagem_url: novaImagemUrl || null,
            ativo: !bloqueado,
            destaque: false,
            visualizacoes: 0,
            cliques_whatsapp: 0,
            status: bloqueado
              ? "bloqueado"
              : "aprovado",
          },
        ])

      setSalvandoProduto(false)

      if (error) {
        console.error("Erro ao salvar produto:", error)
        alert("Erro ao salvar produto.")
        return
      }

      if (bloqueado) {
        alert(
          "Produto enviado para análise por conter termos restritos."
        )
      } else {
        alert("Produto salvo com sucesso!")
      }
    }

    limparProduto()
    await carregarProdutos(userId, lojaId)
  }

  async function alterarProdutoAtivo(produto: any) {
    const novoStatus = produto.ativo === false

    const { error } = await supabase
      .from("produtos")
      .update({
        ativo: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", produto.id)
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      alert("Erro ao alterar status do produto.")
      return
    }

    await carregarProdutos(userId, lojaId)
  }

  async function alterarProdutoDestaque(produto: any) {
    const { error } = await supabase
      .from("produtos")
      .update({
        destaque: produto.destaque !== true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", produto.id)
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      alert("Erro ao alterar destaque.")
      return
    }

    await carregarProdutos(userId, lojaId)
  }

  async function assinarPlano(
  planoEscolhido: PlanoCatalogo
) {
  if (processandoPagamento) return

  if (
    planoJaContratado(planoEscolhido.codigo)
  ) {
    alert(
      "Este já é o plano atual da sua loja."
    )
    return
  }

  try {
    setProcessandoPagamento(true)

    const response = await fetch(
      "/api/mercadopago",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plano: planoEscolhido.codigo,
          plano_id: planoEscolhido.id,
          periodo: planoEscolhido.periodo,
          meses: planoEscolhido.meses,
          preco: Number(
            planoEscolhido.preco
          ),
          loja_id: loja.id,
        }),
      }
    )

    const data = await response.json()

    const checkout =
      data.sandbox_init_point ||
      data.init_point

    if (!response.ok || !checkout) {
      alert(
        data?.detalhes ||
          data?.error ||
          "Erro ao gerar pagamento."
      )
      return
    }

    window.open(checkout, "_blank")
  } catch (error) {
    console.error(
      "Erro ao iniciar pagamento:",
      error
    )

    alert(
      "Erro ao conectar ao Mercado Pago."
    )
  } finally {
    setProcessandoPagamento(false)
  }
}
  async function excluirProduto(id: number) {
    const confirmar = confirm(
      "Tem certeza que deseja excluir este produto?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error(error)
      alert("Erro ao excluir produto.")
      return
    }

    await carregarProdutos(userId, lojaId)
  }
 
function planoJaContratado(plano: string) {
  const planoAtual = String(
    loja?.plano ||
      (loja?.patrocinado
        ? "patrocinado"
        : loja?.premium
          ? "premium"
          : "gratis")
  ).toLowerCase()

  return planoAtual === plano
}

  function linkPublico() {
    if (!loja) return "/"

    return `/loja/${loja.id}-${loja.nome
      .toLowerCase()
      .replaceAll(" ", "-")}`
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">
          Carregando loja...
        </h1>
      </main>
    )
  }

  if (!loja) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">
          Loja não encontrada
        </h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a
              href="/lojista"
              className="text-sm text-green-300"
            >
              ← Voltar ao painel
            </a>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              {loja.nome}
            </h1>

            <p className="mt-3 text-zinc-400">
              Central de gerenciamento da loja
            </p>
          </div>

          <a
            href={linkPublico()}
            target="_blank"
            className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
          >
            Ver loja pública
          </a>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Produtos</p>
            <h3 className="text-4xl font-black">
              {produtos.length}
            </h3>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Ativos</p>
            <h3 className="text-4xl font-black">
              {
                produtos.filter(
                  (produto) => produto.ativo !== false
                ).length
              }
            </h3>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Promoções</p>
            <h3 className="text-4xl font-black text-red-300">
              {
                produtos.filter(
                  (produto) => produto.promocao === true
                ).length
              }
            </h3>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Visualizações</p>
            <h3 className="text-4xl font-black text-blue-300">
              {produtos.reduce(
                (total, produto) =>
                  total +
                  Number(produto.visualizacoes || 0),
                0
              )}
            </h3>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Plano</p>
            <h3 className="text-2xl font-black uppercase">
              {loja.plano ||
                (loja.premium ? "premium" : "grátis")}
            </h3>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="text-3xl font-black">
            Upgrade da loja
          </h2>
<p className="mt-2 text-sm font-bold text-blue-300">
  {carregandoPlanos
    ? "Carregando opções de assinatura..."
    : `${planosCatalogo.length} opções de assinatura disponíveis`}
</p>
          <p className="mt-2 text-zinc-400">
            Destaque sua loja e apareça para mais clientes.
          </p>

          <div className="mt-6">
  <GerenciarPlanos
    planos={planosCatalogo}
    planoAtual={
      loja.plano ||
      (loja.patrocinado
        ? "patrocinado"
        : loja.premium
          ? "premium"
          : "gratis")
    }
    processandoPagamento={
      processandoPagamento
    }
    onConfirmarPagamento={
      assinarPlano
    }
  />
</div>
        </section>

        <section className="mt-10 rounded-3xl border border-green-400/20 bg-green-400/5 p-6">
          <h2 className="text-3xl font-black">
            {produtoEditando
              ? "Editar produto"
              : "Novo produto"}
          </h2>

          <p className="mt-2 text-zinc-400">
            Cadastre produtos e serviços encontrados pelos
            clientes da sua cidade.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Nome do produto ou serviço *
              </label>

              <input
                value={produtoNome}
                onChange={(evento) =>
                  setProdutoNome(evento.target.value)
                }
                placeholder="Ex.: iPhone 15 Pro 256 GB"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none focus:border-green-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Categoria *
              </label>

              <input
                value={produtoCategoria}
                onChange={(evento) =>
                  setProdutoCategoria(evento.target.value)
                }
                placeholder="Ex.: Smartphones"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none focus:border-green-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Marca
              </label>

              <input
                value={produtoMarca}
                onChange={(evento) =>
                  setProdutoMarca(evento.target.value)
                }
                placeholder="Ex.: Apple"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none focus:border-green-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Preço normal
              </label>

              <input
                value={produtoPreco}
                onChange={(evento) =>
                  setProdutoPreco(evento.target.value)
                }
                placeholder="Ex.: 4.999,90"
                inputMode="decimal"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none focus:border-green-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Preço promocional
              </label>

              <input
                value={produtoPrecoPromocional}
                onChange={(evento) =>
                  setProdutoPrecoPromocional(
                    evento.target.value
                  )
                }
                placeholder="Ex.: 4.499,90"
                inputMode="decimal"
                disabled={!produtoPromocao}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none focus:border-red-400/50 disabled:cursor-not-allowed disabled:opacity-40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Estoque
              </label>

              <input
                type="number"
                min="0"
                value={produtoEstoque}
                onChange={(evento) =>
                  setProdutoEstoque(evento.target.value)
                }
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none focus:border-green-400/50"
              />
            </div>

            <div className="flex flex-col justify-end gap-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-4">
                <input
                  type="checkbox"
                  checked={produtoDisponivel}
                  onChange={(evento) =>
                    setProdutoDisponivel(
                      evento.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

                <span className="font-bold">
                  Produto disponível
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <input
                  type="checkbox"
                  checked={produtoPromocao}
                  onChange={(evento) => {
                    setProdutoPromocao(
                      evento.target.checked
                    )

                    if (!evento.target.checked) {
                      setProdutoPrecoPromocional("")
                    }
                  }}
                  className="h-5 w-5"
                />

                <span className="font-bold text-red-300">
                  🔥 Produto em promoção
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Descrição
              </label>

              <textarea
                value={produtoDescricao}
                onChange={(evento) =>
                  setProdutoDescricao(evento.target.value)
                }
                placeholder="Descreva as principais características, condições e diferenciais."
                maxLength={1000}
                className="min-h-[140px] w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none focus:border-green-400/50"
              />

              <p className="mt-2 text-right text-xs text-zinc-500">
                {produtoDescricao.length}/1000
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-zinc-400">
                Imagem
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(evento) => {
                  if (evento.target.files?.[0]) {
                    setProdutoImagem(
                      evento.target.files[0]
                    )
                  }
                }}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none"
              />
            </div>

            {produtoImagem && (
              <img
                src={URL.createObjectURL(produtoImagem)}
                alt="Pré-visualização"
                className="h-64 w-full rounded-2xl object-cover md:col-span-2"
              />
            )}
{produtoEditando && (
  <div className="md:col-span-2">
    <GaleriaProduto
      produtoId={Number(produtoEditando.id)}
      limiteImagens={6}
      aoAtualizarImagemPrincipal={(imagemUrl) =>
        atualizarImagemPrincipalProduto(
          Number(produtoEditando.id),
          imagemUrl
        )
      }
    />
  </div>
)}
            <button
              onClick={salvarProduto}
              disabled={
                uploadingProduto || salvandoProduto
              }
              className="w-full rounded-2xl bg-green-400 py-5 text-lg font-black text-black disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
            >
              {uploadingProduto
                ? "Enviando imagem..."
                : salvandoProduto
                  ? "Salvando..."
                  : produtoEditando
                    ? "Salvar alterações"
                    : "Cadastrar produto"}
            </button>

            {produtoEditando && (
              <button
                onClick={limparProduto}
                className="w-full rounded-2xl border border-white/20 py-5 text-lg font-black md:col-span-2"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">
                Produtos da loja
              </h2>

              <p className="mt-2 text-zinc-400">
                Gerencie estoque, preços, promoções e
                visibilidade.
              </p>
            </div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-zinc-300">
              {produtos.length} produto(s)
            </span>
          </div>

          {produtos.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-900 p-8 text-zinc-400">
              Esta loja ainda não possui produtos cadastrados.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {produtos.map((produto) => {
                const precoNormal = Number(produto.preco || 0)
                const precoPromocional = Number(
                  produto.preco_promocional || 0
                )

                const temPromocao =
                  produto.promocao === true &&
                  precoPromocional > 0 &&
                  precoPromocional < precoNormal

                const economia = temPromocao
                  ? precoNormal - precoPromocional
                  : 0

                return (
                  <article
                    key={produto.id}
                    className={`overflow-hidden rounded-3xl border ${
                      produto.ativo === false
                        ? "border-red-500/30 bg-red-950/30"
                        : produto.destaque
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-white/10 bg-zinc-900"
                    }`}
                  >
                    {produto.imagem_url ? (
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-black/30 text-zinc-500">
                        Produto sem imagem
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {produto.ativo === false ? (
                          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                            INATIVO
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-black text-black">
                            ATIVO
                          </span>
                        )}

                        {produto.destaque && (
                          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                            ⭐ DESTAQUE
                          </span>
                        )}

                        {temPromocao && (
                          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                            🔥 PROMOÇÃO
                          </span>
                        )}

                        {produto.disponivel === false && (
                          <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-black text-white">
                            INDISPONÍVEL
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-2xl font-black">
                        {produto.nome}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-400">
                        {produto.categoria && (
                          <span>{produto.categoria}</span>
                        )}

                        {produto.marca && (
                          <>
                            <span>•</span>
                            <span>{produto.marca}</span>
                          </>
                        )}
                      </div>

                      {temPromocao ? (
                        <div className="mt-4">
                          <p className="text-sm text-zinc-500 line-through">
                            R${" "}
                            {precoNormal
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>

                          <p className="text-3xl font-black text-red-300">
                            R${" "}
                            {precoPromocional
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>

                          <p className="mt-1 text-sm font-bold text-green-300">
                            Economize R${" "}
                            {economia
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>
                      ) : produto.preco ? (
                        <p className="mt-4 text-3xl font-black text-green-300">
                          R${" "}
                          {precoNormal
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      ) : null}

                      <div className="mt-4 grid grid-cols-3 gap-3">
  <div className="rounded-2xl bg-black/30 p-3">
    <p className="text-xs text-zinc-500">
      Estoque
    </p>

    <p className="mt-1 font-black">
      {produto.estoque || 0} unidade(s)
    </p>
  </div>

  <div className="rounded-2xl bg-black/30 p-3">
    <p className="text-xs text-zinc-500">
      Visualizações
    </p>

    <p className="mt-1 font-black">
      {produto.visualizacoes || 0}
    </p>
  </div>

  <div className="rounded-2xl bg-black/30 p-3">
    <p className="text-xs text-zinc-500">
      Interesses
    </p>

    <p className="mt-1 font-black text-green-300">
      {produto.cliques_whatsapp || 0}
    </p>
  </div>
</div>

                      {produto.descricao && (
                        <p className="mt-4 line-clamp-3 text-zinc-400">
                          {produto.descricao}
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            editarProduto(produto)
                          }
                          className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            alterarProdutoAtivo(produto)
                          }
                          className="rounded-2xl bg-green-400 px-5 py-3 font-black text-black"
                        >
                          {produto.ativo === false
                            ? "Ativar"
                            : "Desativar"}
                        </button>

                        <button
                          onClick={() =>
                            alterarProdutoDestaque(produto)
                          }
                          className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black"
                        >
                          {produto.destaque
                            ? "Remover destaque"
                            : "Destacar"}
                        </button>

                        <button
                          onClick={() =>
                            excluirProduto(produto.id)
                          }
                          className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}