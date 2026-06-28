"use client"

import { useState } from "react"
import { supabase } from "../supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  async function fazerLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      alert("Erro no login: " + error.message)
      return
    }

    if (email === "vemverapp@gmail.com") {
      window.location.href = "/admin"
      return
    }

    window.location.href = "/lojista"
  }

  async function criarConta() {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (error) {
      alert(error.message)
      return
    }

    alert("Conta criada com sucesso! Agora faça login.")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-8">
        <h1 className="text-4xl font-black">Entrar</h1>

        <p className="mt-2 text-zinc-400">
          Acesse sua conta VemVer
        </p>

        <div className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            className="w-full rounded-2xl bg-black p-4 outline-none"
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            className="w-full rounded-2xl bg-black p-4 outline-none"
          />

          <button
            onClick={fazerLogin}
            className="w-full rounded-2xl bg-green-400 py-4 font-black text-black"
          >
            Entrar
          </button>

          <button
            onClick={criarConta}
            className="w-full rounded-2xl border border-white/20 py-4 font-bold"
          >
            Criar conta
          </button>
        </div>
      </div>
    </main>
  )
}