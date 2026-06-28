"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function AdminPage() {
  const [carregando, setCarregando] = useState(true)
  const [lojas, setLojas] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  useEffect(() => {
    verificarAdmin()
  }, [])

  async function verificarAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login"
        return
      }

      if (user.email !== "vemverapp@gmail.com") {
        alert("Acesso negado")
        window.location.href = "/"
        return
      }

      await carregarDados()
    } catch (error) {
      console.log(error)
    } finally {
      setCarregando(false)
    }
  }

  async function carregarDados() {
    const { data: lojasData } = await supabase
      .from("lojas")
      .select("*")
      .order("id", { ascending: false })

    const { data: produtosData } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false })
const { data: solicitacoesData } = await supabase
  .from("solicitacoes_planos")
  .select("*")
  .order("id", { ascending: false })
    setLojas(lojasData || [])
    setProdutos(produtosData || [])
    setSolicitacoes(solicitacoesData || [])
  }
  

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  async function alterarPremium(loja: any) {
    await supabase
      .from("lojas")
      .update({ premium: !loja.premium })
      .eq("id", loja.id)

    carregarDados()
  }
  async function alterarPatrocinado(loja: any) {
  await supabase
    .from("lojas")
    .update({
      patrocinado: !loja.patrocinado,
    })
    .eq("id", loja.id)

  carregarDados()
}
async function aprovarPlano(solicitacao: any) {
  const plano =
    solicitacao.plano_solicitado === "franquia"
      ? { plano: "franquia", limite_lojas: 999 }
      : { plano: "multiunidade", limite_lojas: 5 }

  await supabase
    .from("lojas")
    .update(plano)
    .eq("user_id", solicitacao.user_id)

  await supabase
    .from("solicitacoes_planos")
    .update({
      status: "aprovada",
    })
    .eq("id", solicitacao.id)

  carregarDados()
}
  async function alterarStatusLoja(loja: any, status: string) {
  await supabase
    .from("lojas")
    .update({
      status,
      ativo: status === "aprovada",
    })
    .eq("id", loja.id)

  carregarDados()
}
async function alterarPlanoLoja(loja: any, plano: string, limite: number) {
  await supabase
    .from("lojas")
    .update({
      plano,
      limite_lojas: limite,
    })
    .eq("user_id", loja.user_id)

  carregarDados()
}
async function alterarAtivo(loja: any) {
  await supabase
    .from("lojas")
    .update({
      ativo: loja.ativo === false ? true : false,
    })
    .eq("id", loja.id)

  carregarDados()
} 
  async function alterarProdutoAtivo(produto: any) {
    await supabase
      .from("produtos")
      .update({ ativo: produto.ativo === false ? true : false })
      .eq("id", produto.id)

    carregarDados()
  }

  async function alterarProdutoDestaque(produto: any) {
    await supabase
      .from("produtos")
      .update({ destaque: produto.destaque === true ? false : true })
      .eq("id", produto.id)

    carregarDados()
  }

  async function excluirProduto(id: number) {
    const confirmar = confirm("Deseja realmente excluir este produto?")
    if (!confirmar) return

    await supabase
      .from("produtos")
      .delete()
      .eq("id", id)

    carregarDados()
  }

  function nomeDaLoja(lojaId: number) {
    const loja = lojas.find((item) => Number(item.id) === Number(lojaId))
    return loja?.nome || "Loja não encontrada"
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl font-black">
          Carregando painel...
        </h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black">
              Painel Admin
            </h1>

            <p className="mt-3 text-zinc-400">
              Controle geral do VemVer
            </p>
          </div>

          <button
            onClick={sair}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300"
          >
            Sair do Admin
          </button>
        </div>

  <div className="mt-10 grid gap-6 md:grid-cols-4">

  <div className="rounded-3xl bg-zinc-900 p-6">
    <h2 className="text-4xl font-black">
      {lojas.filter((l) => l.status === "em_analise").length}
    </h2>
    <p className="text-zinc-400">
      Em análise
    </p>
  </div>

  <div className="rounded-3xl bg-zinc-900 p-6">
    <h2 className="text-4xl font-black">
      {lojas.filter((l) => l.status === "aprovada").length}
    </h2>
    <p className="text-zinc-400">
      Aprovadas
    </p>
  </div>

  <div className="rounded-3xl bg-zinc-900 p-6">
    <h2 className="text-4xl font-black">
      {lojas.filter((l) => l.status === "rejeitada").length}
    </h2>
    <p className="text-zinc-400">
      Rejeitadas
    </p>
  </div>

  <div className="rounded-3xl bg-zinc-900 p-6">
    <h2 className="text-4xl font-black">
      {lojas.filter((l) => l.premium).length}
    </h2>
    <p className="text-zinc-400">
      Premium
    </p>
  </div>

        </div>
<section className="mt-14">
  <h2 className="text-3xl font-black">
    Solicitações de plano
  </h2>

  <p className="mt-2 text-zinc-400">
    Aprovação de planos Multiunidade e Franquia.
  </p>

  <div className="mt-6 grid gap-4">
    {solicitacoes.filter((s) => s.status === "pendente").length === 0 ? (
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 text-zinc-400">
        Nenhuma solicitação pendente.
      </div>
    ) : (
      solicitacoes
        .filter((s) => s.status === "pendente")
        .map((solicitacao) => (
          <div
            key={solicitacao.id}
            className="rounded-3xl border border-blue-500/30 bg-blue-950/30 p-6"
          >
            <p className="text-sm text-zinc-400">
              Solicitante
            </p>

            <h3 className="text-2xl font-black">
              {solicitacao.email}
            </h3>

            <p className="mt-3 text-zinc-300">
              Plano solicitado:{" "}
              <strong>{solicitacao.plano_solicitado}</strong>
            </p>

            <button
              onClick={() => aprovarPlano(solicitacao)}
              className="mt-5 rounded-2xl bg-green-500 px-5 py-3 font-black text-white"
            >
              Aprovar plano
            </button>
          </div>
        ))
    )}
  </div>
</section>
        <h2 className="mt-14 text-3xl font-black">
          Lojas cadastradas
        </h2>

        <div className="mt-6 grid gap-4">
          {lojas.map((loja) => (
            <div
              key={loja.id}
              className={`rounded-3xl border p-6 ${
                loja.ativo === false
                  ? "border-red-500/30 bg-red-950/30"
                  : loja.premium
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-white/10 bg-zinc-900"
              }`}
            >
              <div className="flex flex-wrap gap-2">
                {loja.premium && (
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-black">
                    ⭐ PREMIUM
                  </span>
                )}

                {loja.ativo === false ? (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white">
                    INATIVA
                  </span>
                ) : (
                  <span className="rounded-full bg-green-400 px-3 py-1 text-sm font-black text-black">
                    ATIVA
                  </span>
                )}
              </div>
              <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-black text-white">
  STATUS: {loja.status || "sem_status"}
</span>
<span className="ml-2 rounded-full bg-purple-500 px-3 py-1 text-sm font-black text-white">
  PLANO: {loja.plano || "gratis"} / {loja.limite_lojas || 1} loja(s)
</span>
              <h3 className="mt-4 text-2xl font-black">
                {loja.nome}
              </h3>

              <p className="mt-2 text-zinc-400">
                {loja.categoria} • {loja.cidade}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                ID: {loja.id}
              </p>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={() => alterarPremium(loja)}
                  className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black"
                >
                  {loja.premium ? "Remover Premium" : "Tornar Premium"}
                </button>
<button
  onClick={() => alterarPatrocinado(loja)}
  className="rounded-2xl bg-blue-500 px-5 py-3 font-black text-white"
>
  {loja.patrocinado ? "Remover Patrocínio" : "Patrocinar"}
</button>
                <button
                  onClick={() => alterarAtivo(loja)}
                  className="rounded-2xl bg-green-400 px-5 py-3 font-black text-black"
                >
                  {loja.ativo === false ? "Ativar Loja" : "Desativar Loja"}
                </button>
<button
  onClick={() => alterarStatusLoja(loja, "aprovada")}
  className="rounded-2xl bg-green-500 px-5 py-3 font-black text-white"
>
  Aprovar
</button>

<button
  onClick={() => alterarStatusLoja(loja, "rejeitada")}
  className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white"
>
  Rejeitar
</button>

<button
  onClick={() => alterarStatusLoja(loja, "em_analise")}
  className="rounded-2xl bg-yellow-500 px-5 py-3 font-black text-black"
>
  Em análise
</button>
<button
  onClick={() => alterarPlanoLoja(loja, "gratis", 1)}
  className="rounded-2xl border border-white/20 px-5 py-3 font-black text-white"
>
  Plano Grátis
</button>

<button
  onClick={() => alterarPlanoLoja(loja, "multiunidade", 5)}
  className="rounded-2xl bg-blue-500 px-5 py-3 font-black text-white"
>
  Multiunidade
</button>

<button
  onClick={() => alterarPlanoLoja(loja, "franquia", 999)}
  className="rounded-2xl bg-purple-500 px-5 py-3 font-black text-white"
>
  Franquia
</button>
                <a
                  href={`/loja/${loja.id}-${loja.nome
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                  target="_blank"
                  className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
                >
                  Ver loja
                </a>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-black">
          Produtos cadastrados
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
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
                  alt={produto.nome}
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
              </div>

              <h3 className="mt-4 text-2xl font-black">
                {produto.nome}
              </h3>

              <p className="mt-2 text-zinc-400">
                {produto.descricao}
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Loja: {nomeDaLoja(produto.loja_id)}
              </p>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={() => alterarProdutoAtivo(produto)}
                  className="rounded-2xl bg-green-400 px-5 py-3 font-black text-black"
                >
                  {produto.ativo === false ? "Ativar Produto" : "Desativar Produto"}
                </button>

                <button
                  onClick={() => alterarProdutoDestaque(produto)}
                  className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black"
                >
                  {produto.destaque ? "Remover Destaque" : "Destacar Produto"}
                </button>

                <button
                  onClick={() => excluirProduto(produto.id)}
                  className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white"
                >
                  Excluir Produto
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}