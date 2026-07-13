"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function ClientePage() {
  const [carregando, setCarregando] = useState(true)
  const [email, setEmail] = useState("")

  useEffect(() => {
    carregarCliente()
  }, [])

  async function carregarCliente() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = "/login"
      return
    }

    setEmail(user.email || "")
    setCarregando(false)
  }

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-black">Carregando sua conta...</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a
              href="/"
              className="text-sm font-bold text-green-300"
            >
              ← Voltar para o VemVer
            </a>

            <h1 className="mt-4 text-4xl font-black md:text-6xl">
              Minha conta
            </h1>

            <p className="mt-3 text-zinc-400">
              Acompanhe seus favoritos, avaliações e descobertas.
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              Logado como: <strong>{email}</strong>
            </p>
          </div>

          <button
            onClick={sair}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300"
          >
            Sair
          </button>
        </header>

        <section className="mt-10 rounded-[2rem] border border-green-400/20 bg-gradient-to-br from-green-400/10 to-zinc-900 p-8">
          <span className="rounded-full bg-green-400 px-4 py-2 text-sm font-black text-black">
            👤 CLIENTE VEMVER
          </span>

          <h2 className="mt-6 text-3xl font-black md:text-4xl">
            Bem-vindo à sua área pessoal
          </h2>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Em breve esta página mostrará recomendações personalizadas,
            lojas favoritas, produtos salvos e seu histórico no VemVer.
          </p>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/cliente/favoritos"
            className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-red-400/50"
          >
            <div className="text-4xl">❤️</div>

            <h2 className="mt-5 text-2xl font-black">
              Favoritos
            </h2>

            <p className="mt-2 text-zinc-400">
              Veja lojas e produtos que você salvou.
            </p>
          </a>

          <a
            href="/cliente/avaliacoes"
            className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-yellow-400/50"
          >
            <div className="text-4xl">⭐</div>

            <h2 className="mt-5 text-2xl font-black">
              Minhas avaliações
            </h2>

            <p className="mt-2 text-zinc-400">
              Consulte as avaliações que você publicou.
            </p>
          </a>

          <a
            href="/cliente/historico"
            className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-blue-400/50"
          >
            <div className="text-4xl">🕘</div>

            <h2 className="mt-5 text-2xl font-black">
              Histórico
            </h2>

            <p className="mt-2 text-zinc-400">
              Encontre lojas e produtos vistos recentemente.
            </p>
          </a>

          <a
            href="/cliente/perfil"
            className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition hover:border-green-400/50"
          >
            <div className="text-4xl">⚙️</div>

            <h2 className="mt-5 text-2xl font-black">
              Meu perfil
            </h2>

            <p className="mt-2 text-zinc-400">
              Edite seus dados e preferências.
            </p>
          </a>
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-3xl font-black">
              Recomendações para você
            </h2>

            <p className="mt-2 text-zinc-400">
              Esta área será personalizada com base nas suas buscas,
              favoritos e localização.
            </p>
          </div>

          <div className="rounded-3xl border border-dashed border-white/20 bg-zinc-900 p-10 text-center">
            <div className="text-5xl">✨</div>

            <h3 className="mt-5 text-2xl font-black">
              Sua experiência personalizada está começando
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Explore lojas e produtos. Conforme você usa o VemVer,
              suas recomendações ficarão cada vez melhores.
            </p>

            <a
              href="/"
              className="mt-6 inline-block rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
            >
              Explorar o VemVer
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}