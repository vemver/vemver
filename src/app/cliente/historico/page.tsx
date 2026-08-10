"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../supabase"

export default function HistoricoClientePage() {
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    verificarUsuario()
  }, [])

  async function verificarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.replace("/login")
      return
    }

    setCarregando(false)
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-black">
          Carregando histórico...
        </h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <a
          href="/cliente"
          className="text-sm font-bold text-green-300"
        >
          ← Voltar para minha conta
        </a>

        <section className="mt-8 rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-400/10 to-zinc-900 p-8">
          <div className="text-5xl">🕘</div>

          <h1 className="mt-5 text-4xl font-black">
            Histórico
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Aqui aparecerão as lojas e os produtos que você visualizou
            recentemente no VemVer.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-dashed border-white/20 bg-zinc-900 p-10 text-center">
          <div className="text-5xl">📍</div>

          <h2 className="mt-5 text-2xl font-black">
            Nenhum histórico disponível
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Continue explorando o VemVer. As lojas e os produtos visitados
            aparecerão aqui futuramente.
          </p>

          <a
            href="/"
            className="mt-6 inline-block rounded-2xl bg-green-400 px-6 py-4 font-black text-black"
          >
            Explorar lojas
          </a>
        </section>
      </div>
    </main>
  )
}