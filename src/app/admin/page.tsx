"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../supabase"

const ADMIN_EMAIL = "stanleyboiacg@gmail.com"

export default function AdminPage() {
  const router = useRouter()

  const [autorizado, setAutorizado] = useState(false)
  const [verificandoAdmin, setVerificandoAdmin] = useState(true)

  const [lojas, setLojas] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState("todas")

  useEffect(() => {
    async function verificarAdmin() {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email

      if (email !== ADMIN_EMAIL) {
        alert("Acesso negado. Área exclusiva para administrador.")
        router.push("/login")
        return
      }

      setAutorizado(true)
      setVerificandoAdmin(false)
      carregarLojas()
    }

    verificarAdmin()
  }, [router])

  async function carregarLojas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("lojas")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      alert("Erro ao carregar lojas")
      setCarregando(false)
      return
    }

    setLojas(data || [])
    setCarregando(false)
  }

  async function alterarPremium(id: number, premiumAtual: boolean) {
    const { error } = await supabase
      .from("lojas")
      .update({ premium: !premiumAtual })
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    carregarLojas()
  }

  async function alterarAtivo(id: number, ativoAtual: boolean) {
    const { error } = await supabase
      .from("lojas")
      .update({ ativo: !ativoAtual })
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    carregarLojas()
  }

  async function excluirLoja(id: number) {
    const confirmar = confirm("Tem certeza que deseja excluir esta loja?")
    if (!confirmar) return

    const { error } = await supabase.from("lojas").delete().eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    carregarLojas()
  }

  const lojasFiltradas = lojas.filter((loja) => {
    const texto = busca.toLowerCase()

    const bateBusca =
      loja.nome?.toLowerCase().includes(texto) ||
      loja.cidade?.toLowerCase().includes(texto) ||
      loja.categoria?.toLowerCase().includes(texto)

    if (!bateBusca) return false

    if (filtro === "premium") return loja.premium === true
    if (filtro === "ativas") return loja.ativo !== false
    if (filtro === "inativas") return loja.ativo === false

    return true
  })

  const totalLojas = lojas.length
  const totalPremium = lojas.filter((loja) => loja.premium === true).length
  const totalAtivas = lojas.filter((loja) => loja.ativo !== false).length
  const totalInativas = lojas.filter((loja) => loja.ativo === false).length
  const totalUsuarios = new Set(lojas.map((loja) => loja.user_id)).size

  if (verificandoAdmin) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Verificando acesso administrativo...</p>
      </main>
    )
  }

  if (!autorizado) return null

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black">Painel Administrativo VemVer</h1>

        <p className="mt-4 text-zinc-400">
          Área exclusiva para administradores.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Card titulo="Total" valor={totalLojas} />
            <Card titulo="Premium" valor={totalPremium} cor="text-green-400" />
            <Card titulo="Ativas" valor={totalAtivas} cor="text-blue-400" />
            <Card titulo="Inativas" valor={totalInativas} cor="text-red-400" />
            <Card titulo="Usuários" valor={totalUsuarios} cor="text-cyan-400" />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar loja, cidade ou categoria..."
              className="rounded-2xl border border-white/10 bg-black p-4"
            />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black p-4"
            >
              <option value="todas">Todas</option>
              <option value="premium">Premium</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Lojas Encontradas ({lojasFiltradas.length})
            </h2>

            <button
              onClick={carregarLojas}
              className="rounded-2xl border border-white/20 px-5 py-3 font-bold"
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <p>Carregando...</p>
          ) : (
            <div className="space-y-4">
              {lojasFiltradas.map((loja) => (
                <div
                  key={loja.id}
                  className={`rounded-2xl border p-5 ${
                    loja.ativo === false
                      ? "border-red-500/30 bg-red-950/30 opacity-70"
                      : "border-white/10 bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xl font-black">{loja.nome}</h3>
                      <p>{loja.categoria}</p>
                      <p>{loja.cidade}</p>
                      <p className="text-xs text-zinc-500">ID: {loja.id}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => alterarPremium(loja.id, loja.premium)}
                        className="rounded-xl bg-green-600 px-4 py-2 font-bold"
                      >
                        {loja.premium ? "Remover Premium" : "Tornar Premium"}
                      </button>

                      <button
                        onClick={() => alterarAtivo(loja.id, loja.ativo)}
                        className="rounded-xl bg-orange-600 px-4 py-2 font-bold"
                      >
                        {loja.ativo === false ? "Ativar" : "Desativar"}
                      </button>

                      <a
                        href={`/loja/${loja.id}-${loja.nome
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                        target="_blank"
                        className="rounded-xl border border-white/20 px-4 py-2 font-bold"
                      >
                        Ver loja
                      </a>

                      <button
                        onClick={() => excluirLoja(loja.id)}
                        className="rounded-xl bg-red-600 px-4 py-2 font-bold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function Card({
  titulo,
  valor,
  cor = "text-white",
}: {
  titulo: string
  valor: number
  cor?: string
}) {
  return (
    <div className="rounded-2xl bg-zinc-800 p-6">
      <p className="text-zinc-400">{titulo}</p>
      <h3 className={`mt-2 text-4xl font-black ${cor}`}>{valor}</h3>
    </div>
  )
}