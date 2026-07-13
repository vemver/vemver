"use client"

import { useState } from "react"
import { supabase } from "../supabase"

type TipoConta = "cliente" | "lojista"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [tipoConta, setTipoConta] = useState<TipoConta>("cliente")
  const [carregando, setCarregando] = useState(false)

  function validarCampos() {
    if (!email.trim()) {
      alert("Digite seu e-mail.")
      return false
    }

    if (!senha) {
      alert("Digite sua senha.")
      return false
    }

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.")
      return false
    }

    return true
  }

  async function fazerLogin() {
    if (!validarCampos()) return

    setCarregando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    })

    if (error) {
      setCarregando(false)
      alert("Erro no login: " + error.message)
      return
    }

    const user = data.user

    if (!user) {
      setCarregando(false)
      alert("Não foi possível localizar sua conta.")
      return
    }

    if (user.email === "vemverapp@gmail.com") {
      window.location.href = "/admin"
      return
    }

    const tipoSalvo = user.user_metadata?.tipo_conta

    if (tipoSalvo === "cliente") {
      window.location.href = "/cliente"
      return
    }

    /*
      Contas antigas não possuem tipo_conta.
      Para não bloquear os lojistas que já existem,
      contas sem tipo definido continuam indo ao painel lojista.
    */
    window.location.href = "/lojista"
  }

  async function criarConta() {
    if (!validarCampos()) return

    setCarregando(true)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: {
        data: {
          tipo_conta: tipoConta,
        },
      },
    })

    setCarregando(false)

    if (error) {
      alert("Erro ao criar conta: " + error.message)
      return
    }

    if (!data.session) {
      alert(
        "Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login."
      )
      return
    }

    if (tipoConta === "cliente") {
      window.location.href = "/cliente"
      return
    }

    window.location.href = "/lojista"
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        <button
          onClick={() => (window.location.href = "/")}
          className="mb-6 text-sm font-bold text-green-300"
        >
          ← Voltar para o VemVer
        </button>

        <h1 className="text-4xl font-black">Bem-vindo</h1>

        <p className="mt-2 text-zinc-400">
          Entre ou crie sua conta no VemVer.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-black p-2">
          <button
            type="button"
            onClick={() => setTipoConta("cliente")}
            className={`rounded-xl px-4 py-4 font-black transition ${
              tipoConta === "cliente"
                ? "bg-green-400 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            👤 Cliente
          </button>

          <button
            type="button"
            onClick={() => setTipoConta("lojista")}
            className={`rounded-xl px-4 py-4 font-black transition ${
              tipoConta === "lojista"
                ? "bg-orange-400 text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            🏪 Lojista
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          {tipoConta === "cliente" ? (
            <>
              <p className="font-black text-green-300">
                Quero encontrar lojas e produtos
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Salve favoritos, avalie lojas e receba recomendações.
              </p>
            </>
          ) : (
            <>
              <p className="font-black text-orange-300">
                Quero divulgar meu negócio
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Cadastre sua loja, produtos e aumente sua visibilidade.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            autoComplete="email"
            className="w-full rounded-2xl border border-white/10 bg-black p-4 outline-none transition focus:border-green-400/60"
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") fazerLogin()
            }}
            className="w-full rounded-2xl border border-white/10 bg-black p-4 outline-none transition focus:border-green-400/60"
          />

          <button
            onClick={fazerLogin}
            disabled={carregando}
            className="w-full rounded-2xl bg-green-400 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Aguarde..." : "Entrar"}
          </button>

          <button
            onClick={criarConta}
            disabled={carregando}
            className="w-full rounded-2xl border border-white/20 py-4 font-bold transition hover:border-green-400/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tipoConta === "cliente"
              ? "Criar conta de cliente"
              : "Criar conta de lojista"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Ao continuar, você concorda com os termos de uso do VemVer.
        </p>
      </div>
    </main>
  )
}