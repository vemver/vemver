"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../supabase"

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

  const [produtoNome, setProdutoNome] = useState("")
  const [produtoDescricao, setProdutoDescricao] = useState("")
  const [produtoPreco, setProdutoPreco] = useState("")
  const [produtoImagem, setProdutoImagem] = useState<File | null>(null)
  const [produtoEditando, setProdutoEditando] = useState<any | null>(null)
  const [uploadingProduto, setUploadingProduto] = useState(false)

  useEffect(() => {
    async function iniciar() {
      const dados = await params
      setLojaId(dados.id)
      carregarTudo(dados.id)
    }

    iniciar()
  }, [])

  async function carregarTudo(idLoja: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    setUserId(user.id)

    const { data: lojaData, error: lojaError } = await supabase
      .from("lojas")
      .select("*")
      .eq("id", Number(idLoja))
      .eq("user_id", user.id)
      .single()

    if (lojaError || !lojaData) {
      alert("Loja não encontrada ou sem permissão")
      window.location.href = "/lojista"
      return
    }

    setLoja(lojaData)
    await carregarProdutos(user.id, idLoja)
    setCarregando(false)
  }

  async function carregarProdutos(idUsuario: string, idLoja: string) {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("loja_id", Number(idLoja))
      .eq("user_id", idUsuario)
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setProdutos(data || [])
  }

  async function enviarImagemProduto() {
    if (!produtoImagem) return ""

    setUploadingProduto(true)

    const nomeArquivo = `produtos/${Date.now()}-${produtoImagem.name}`

    const { error: uploadError } = await supabase.storage
      .from("lojas")
      .upload(nomeArquivo, produtoImagem)

    if (uploadError) {
      setUploadingProduto(false)
      alert("Erro ao enviar imagem do produto")
      console.log(uploadError)
      return ""
    }

    const { data } = supabase.storage.from("lojas").getPublicUrl(nomeArquivo)

    setUploadingProduto(false)
    return data.publicUrl
  }

  function limparProduto() {
    setProdutoNome("")
    setProdutoDescricao("")
    setProdutoPreco("")
    setProdutoImagem(null)
    setProdutoEditando(null)
  }

  function editarProduto(produto: any) {
    setProdutoEditando(produto)
    setProdutoNome(produto.nome || "")
    setProdutoDescricao(produto.descricao || "")
    setProdutoPreco(produto.preco ? String(produto.preco) : "")
    setProdutoImagem(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function salvarProduto() {
    if (!produtoNome) {
      alert("Digite o nome do produto")
      return
    }

    const novaImagemUrl = await enviarImagemProduto()
    if (produtoImagem && !novaImagemUrl) return

    const precoFormatado = produtoPreco
      ? Number(produtoPreco.replace(",", "."))
      : null

    const textoCompleto =
      `${produtoNome} ${produtoDescricao}`.toLowerCase()

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

    if (produtoEditando) {
      const { error } = await supabase
        .from("produtos")
        .update({
          nome: produtoNome,
          descricao: produtoDescricao,
          preco: precoFormatado,
          imagem_url: novaImagemUrl || produtoEditando.imagem_url,
          ativo: bloqueado ? false : produtoEditando.ativo,
          status: bloqueado
            ? "bloqueado"
            : produtoEditando.status || "aprovado",
        })
        .eq("id", produtoEditando.id)
        .eq("user_id", userId)

      if (error) {
        alert("Erro ao atualizar produto")
        console.log(error)
        return
      }

      alert("Produto atualizado com sucesso!")
    } else {
      const { error } = await supabase.from("produtos").insert([
        {
          nome: produtoNome,
          descricao: produtoDescricao,
          preco: precoFormatado,
          loja_id: Number(lojaId),
          user_id: userId,
          imagem_url: novaImagemUrl,
          ativo: !bloqueado,
          destaque: false,
          status: bloqueado ? "bloqueado" : "aprovado",
        },
      ])

      if (error) {
        alert("Erro ao salvar produto")
        console.log(error)
        return
      }

      if (bloqueado) {
        alert("Produto enviado para análise por conter termos restritos.")
      } else {
        alert("Produto salvo com sucesso!")
      }
    }

    limparProduto()
    carregarProdutos(userId, lojaId)
  }

  async function alterarProdutoAtivo(produto: any) {
    const { error } = await supabase
      .from("produtos")
      .update({ ativo: produto.ativo === false ? true : false })
      .eq("id", produto.id)
      .eq("user_id", userId)

    if (error) {
      alert("Erro ao alterar status do produto")
      console.log(error)
      return
    }

    carregarProdutos(userId, lojaId)
  }

  async function alterarProdutoDestaque(produto: any) {
    const { error } = await supabase
      .from("produtos")
      .update({ destaque: produto.destaque === true ? false : true })
      .eq("id", produto.id)
      .eq("user_id", userId)

    if (error) {
      alert("Erro ao alterar destaque")
      console.log(error)
      return
    }

    carregarProdutos(userId, lojaId)
  }
async function assinarPlano(plano: string) {
  console.log("CLICOU NO BOTÃO:", plano)
  try {
    const response = await fetch("/api/mercadopago", {
      
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  plano,
  loja_id: loja.id,
}),
    })
console.log("STATUS:", response.status)
    const data = await response.json()
console.log("RESPOSTA:", data)
console.log("SANDBOX:", data.sandbox_init_point)
console.log("PRODUÇÃO:", data.init_point)
    if (data.init_point) {
     window.open(data.sandbox_init_point || data.init_point, "_blank")
    } else {
      alert("Erro ao gerar pagamento")
    }
  } catch (error) {
    console.log(error)
    alert("Erro ao conectar ao Mercado Pago")
  }
}
  async function excluirProduto(id: number) {
    const confirmar = confirm("Tem certeza que deseja excluir este produto?")
    if (!confirmar) return

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      alert("Erro ao excluir produto")
      console.log(error)
      return
    }

    carregarProdutos(userId, lojaId)
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
        <h1 className="text-3xl font-black">Carregando loja...</h1>
      </main>
    )
  }

  if (!loja) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">Loja não encontrada</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a href="/lojista" className="text-sm text-green-300">
              ← Voltar ao painel
            </a>

            <h1 className="mt-4 text-4xl md:text-6xl font-black">
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

        <section className="mt-10 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Produtos</p>
            <h3 className="text-4xl font-black">{produtos.length}</h3>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Ativos</p>
            <h3 className="text-4xl font-black">
              {produtos.filter((p) => p.ativo !== false).length}
            </h3>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Destaques</p>
            <h3 className="text-4xl font-black text-yellow-300">
              {produtos.filter((p) => p.destaque === true).length}
            </h3>
          </div>

          <div className="rounded-3xl bg-zinc-900 p-6">
            <p className="text-zinc-400">Plano</p>
            <h3 className="text-2xl font-black">
              {loja.premium ? "Premium" : "Grátis"}
            </h3>
          </div>
        </section>
<section className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6">
  <h2 className="text-3xl font-black">
    Upgrade da Loja
  </h2>

  <p className="mt-2 text-zinc-400">
    Destaque sua loja e apareça para mais clientes.
  </p>

  <div className="mt-6 flex flex-wrap gap-4">
    <button
  onClick={() => assinarPlano("premium")}
  className="rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black"
    >
      ⭐ Premium - R$ 49,90
    </button>

   <button
  onClick={() => assinarPlano("patrocinado")}
  className="rounded-2xl bg-blue-500 px-6 py-4 font-black text-white"
>
  🚀 Patrocinado - R$ 99,90
</button>

    <button
  onClick={() => assinarPlano("multiunidade")}
  className="rounded-2xl bg-purple-500 px-6 py-4 font-black text-white"
>
  🏢 Multiunidade - R$ 149,90
</button>
  </div>
</section>
        <section className="mt-10 rounded-3xl border border-green-400/20 bg-green-400/5 p-6">
          <h2 className="text-3xl font-black">
            {produtoEditando ? "Editar produto" : "Novo produto"}
          </h2>

          <p className="mt-2 text-zinc-400">
            Cadastre produtos ou serviços que aparecerão dentro da sua loja.
          </p>

          <div className="mt-8 space-y-5">
            <input
              value={produtoNome}
              onChange={(e) => setProdutoNome(e.target.value)}
              placeholder="Nome do produto ou serviço"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none"
            />

            <textarea
              value={produtoDescricao}
              onChange={(e) => setProdutoDescricao(e.target.value)}
              placeholder="Descrição do produto ou serviço"
              className="min-h-[120px] w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none"
            />

            <input
              value={produtoPreco}
              onChange={(e) => setProdutoPreco(e.target.value)}
              placeholder="Preço. Ex: 29,90"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setProdutoImagem(e.target.files[0])
              }}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5 outline-none"
            />

            {produtoImagem && (
              <img
                src={URL.createObjectURL(produtoImagem)}
                className="h-52 w-full rounded-2xl object-cover"
              />
            )}

            <button
              onClick={salvarProduto}
              disabled={uploadingProduto}
              className="w-full rounded-2xl bg-green-400 py-5 text-lg font-black text-black disabled:opacity-50"
            >
              {uploadingProduto
                ? "Enviando imagem..."
                : produtoEditando
                ? "Salvar alterações"
                : "Salvar produto"}
            </button>

            {produtoEditando && (
              <button
                onClick={limparProduto}
                className="w-full rounded-2xl border border-white/20 py-5 text-lg font-black"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-black">Produtos da loja</h2>

          {produtos.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-900 p-8 text-zinc-400">
              Esta loja ainda não tem produtos cadastrados.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className={`rounded-3xl border p-6 ${
                    produto.ativo === false
                      ? "border-red-500/30 bg-red-950/30"
                      : produto.destaque
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-white/10 bg-zinc-900"
                  }`}
                >
                  {produto.imagem_url && (
                    <img
                      src={produto.imagem_url}
                      className="mb-5 h-48 w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="flex flex-wrap gap-2">
                    {produto.ativo === false ? (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white">
                        INATIVO
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-400 px-3 py-1 text-sm font-black text-black">
                        ATIVO
                      </span>
                    )}

                    {produto.destaque && (
                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                        ⭐ DESTAQUE
                      </span>
                    )}

                    {produto.status && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-zinc-300">
                        {produto.status}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-2xl font-black">
                    {produto.nome}
                  </h3>

                  {produto.preco && (
                    <p className="mt-2 text-xl font-black text-green-300">
                      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                    </p>
                  )}

                  {produto.descricao && (
                    <p className="mt-2 text-zinc-400">
                      {produto.descricao}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => editarProduto(produto)}
                      className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => alterarProdutoAtivo(produto)}
                      className="rounded-2xl bg-green-400 px-5 py-3 font-black text-black"
                    >
                      {produto.ativo === false ? "Ativar" : "Desativar"}
                    </button>

                    <button
                      onClick={() => alterarProdutoDestaque(produto)}
                      className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black"
                    >
                      {produto.destaque ? "Remover destaque" : "Destacar"}
                    </button>

                    <button
                      onClick={() => excluirProduto(produto.id)}
                      className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}