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
      alert("Erro no login")
      console.log(error)
      return
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single()

    if (admin) {
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
      console.log(error)
      return
    }

    alert("Conta criada com sucesso! Agora faça login.")
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-4xl font-black">Entrar</h1>

        <p className="mt-2 text-zinc-400">
          Faça login no VemVer
        </p>

        <div className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <button
            onClick={fazerLogin}
            className="w-full rounded-2xl bg-green-400 py-4 font-bold text-black"
          >
            Entrar
          </button>

          <button
            onClick={criarConta}
            className="mt-3 w-full rounded-2xl border border-white/20 py-4 font-bold"
          >
            Criar conta
          </button>
        </div>
      </div>
    </main>
  )
}