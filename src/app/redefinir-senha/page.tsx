"use client"

import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import { supabase } from "../supabase"

export default function RedefinirSenhaPage() {
  const [novaSenha, setNovaSenha] =
    useState("")
  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState("")

  const [
    mostrarNovaSenha,
    setMostrarNovaSenha,
  ] = useState(false)

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false)

  const [verificando, setVerificando] =
    useState(true)

  const [linkValido, setLinkValido] =
    useState(false)

  const [salvando, setSalvando] =
    useState(false)

  useEffect(() => {
  let paginaAtiva = true

  const urlAtual =
    new URL(window.location.href)

  const veioDeRecuperacao =
    urlAtual.hash.includes(
      "type=recovery"
    ) ||
    urlAtual.searchParams.get(
      "type"
    ) === "recovery"

  const {
    data: { subscription },
  } =
    supabase.auth.onAuthStateChange(
      (evento, sessao) => {
        if (!paginaAtiva) return

        /*
          Uma sessão normal de cliente,
          lojista ou administrador não
          libera esta página.

          Somente o evento específico de
          recuperação poderá liberá-la.
        */
        if (
          evento ===
            "PASSWORD_RECOVERY" &&
          sessao
        ) {
          setLinkValido(true)
          setVerificando(false)
        }
      }
    )

  async function verificarRecuperacao() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession()

    if (!paginaAtiva) return

    /*
      Esta verificação cobre o caso em que
      o Supabase processou o link antes do
      componente terminar de carregar.
    */
    setLinkValido(
      veioDeRecuperacao &&
        Boolean(session)
    )

    setVerificando(false)
  }

  verificarRecuperacao()

  return () => {
    paginaAtiva = false
    subscription.unsubscribe()
  }
}, [])
  async function salvarNovaSenha(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault()

    if (novaSenha.length < 6) {
      alert(
        "A nova senha precisa ter pelo menos 6 caracteres."
      )
      return
    }

    if (
      novaSenha !== confirmarSenha
    ) {
      alert(
        "As duas senhas não são iguais."
      )
      return
    }

    setSalvando(true)

    const { error } =
      await supabase.auth.updateUser({
        password: novaSenha,
      })

    if (error) {
      setSalvando(false)

      console.error(
        "Erro ao atualizar senha:",
        error
      )

      alert(
        "Não foi possível atualizar sua senha. Solicite um novo link e tente novamente."
      )

      return
    }

    await supabase.auth.signOut()

    alert(
      "Senha atualizada com sucesso! Agora faça login com sua nova senha."
    )

    window.location.href = "/login"
  }

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-400" />

          <p className="mt-4 font-bold text-zinc-300">
            Verificando seu link...
          </p>
        </div>
      </main>
    )
  }

  if (!linkValido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        <div className="w-full max-w-md rounded-[2rem] border border-red-400/20 bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Link inválido ou expirado
          </h1>

          <p className="mt-3 leading-6 text-zinc-400">
            Por segurança, os links de
            recuperação possuem tempo
            limitado. Solicite um novo
            link para continuar.
          </p>

          <button
            type="button"
            onClick={() =>
              (window.location.href =
                "/recuperar-senha")
            }
            className="mt-7 w-full rounded-2xl bg-green-400 py-4 font-black text-black transition hover:bg-green-300"
          >
            Solicitar novo link
          </button>

          <button
            type="button"
            onClick={() =>
              (window.location.href =
                "/login")
            }
            className="mt-3 w-full rounded-2xl border border-white/15 py-4 font-bold transition hover:border-green-400/50"
          >
            Voltar para o login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-400/10 text-3xl">
          🔑
        </div>

        <h1 className="mt-6 text-3xl font-black">
          Criar nova senha
        </h1>

        <p className="mt-3 leading-6 text-zinc-400">
          Digite e confirme sua nova senha
          de acesso ao VemVer.
        </p>

        <form
          onSubmit={salvarNovaSenha}
          className="mt-7 space-y-5"
        >
          <div>
            <label
              htmlFor="novaSenha"
              className="mb-2 block text-sm font-bold text-zinc-300"
            >
              Nova senha
            </label>

            <div className="relative">
              <input
                id="novaSenha"
                type={
                  mostrarNovaSenha
                    ? "text"
                    : "password"
                }
                value={novaSenha}
                onChange={(evento) =>
                  setNovaSenha(
                    evento.target.value
                  )
                }
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
                disabled={salvando}
                className="w-full rounded-2xl border border-white/10 bg-black p-4 pr-14 outline-none transition focus:border-green-400/60 disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarNovaSenha(
                    (valor) => !valor
                  )
                }
                aria-label={
                  mostrarNovaSenha
                    ? "Ocultar nova senha"
                    : "Mostrar nova senha"
                }
                title={
                  mostrarNovaSenha
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400 transition hover:text-white"
              >
                {mostrarNovaSenha
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="mb-2 block text-sm font-bold text-zinc-300"
            >
              Confirmar nova senha
            </label>

            <div className="relative">
              <input
                id="confirmarSenha"
                type={
                  mostrarConfirmacao
                    ? "text"
                    : "password"
                }
                value={confirmarSenha}
                onChange={(evento) =>
                  setConfirmarSenha(
                    evento.target.value
                  )
                }
                placeholder="Digite novamente"
                autoComplete="new-password"
                disabled={salvando}
                className="w-full rounded-2xl border border-white/10 bg-black p-4 pr-14 outline-none transition focus:border-green-400/60 disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmacao(
                    (valor) => !valor
                  )
                }
                aria-label={
                  mostrarConfirmacao
                    ? "Ocultar confirmação"
                    : "Mostrar confirmação"
                }
                title={
                  mostrarConfirmacao
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400 transition hover:text-white"
              >
                {mostrarConfirmacao
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
            Sua senha deve possuir pelo
            menos 6 caracteres e não deve
            ser compartilhada com outras
            pessoas.
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full rounded-2xl bg-green-400 py-4 font-black text-black transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {salvando
              ? "Atualizando senha..."
              : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </main>
  )
}