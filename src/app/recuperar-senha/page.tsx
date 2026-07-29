"use client"

import {
  useState,
  type FormEvent,
} from "react"

import { supabase } from "../supabase"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [carregando, setCarregando] =
    useState(false)
  const [emailEnviado, setEmailEnviado] =
    useState(false)

  async function enviarRecuperacao(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault()

    const emailFormatado = email
      .trim()
      .toLowerCase()

    if (
      !emailFormatado ||
      !emailFormatado.includes("@")
    ) {
      alert("Digite um e-mail válido.")
      return
    }

    setCarregando(true)

    const urlRedirecionamento =
      `${window.location.origin}/redefinir-senha`

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        emailFormatado,
        {
          redirectTo:
            urlRedirecionamento,
        }
      )

    setCarregando(false)

    if (error) {
      console.error(
        "Erro ao enviar recuperação:",
        error
      )

      alert(
        "Não foi possível enviar o e-mail agora. Aguarde alguns minutos e tente novamente."
      )

      return
    }

    /*
      A mensagem não confirma se o e-mail
      realmente existe no cadastro. Isso
      evita que terceiros descubram quais
      e-mails possuem conta no VemVer.
    */
    setEmailEnviado(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        <button
          type="button"
          onClick={() =>
            (window.location.href =
              "/login")
          }
          className="mb-6 text-sm font-bold text-green-300"
        >
          ← Voltar para o login
        </button>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-400/10 text-3xl">
          🔐
        </div>

        <h1 className="mt-6 text-3xl font-black">
          Recuperar senha
        </h1>

        {emailEnviado ? (
          <div className="mt-6">
            <div className="rounded-2xl border border-green-400/25 bg-green-400/10 p-5">
              <p className="font-black text-green-300">
                Verifique seu e-mail
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Se existir uma conta
                cadastrada com esse e-mail,
                enviaremos um link seguro
                para criar uma nova senha.
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Verifique também as pastas
                de spam e lixo eletrônico.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/login")
              }
              className="mt-6 w-full rounded-2xl bg-green-400 py-4 font-black text-black transition hover:bg-green-300"
            >
              Voltar para o login
            </button>

            <button
              type="button"
              onClick={() =>
                setEmailEnviado(false)
              }
              className="mt-3 w-full rounded-2xl border border-white/15 py-4 font-bold transition hover:border-green-400/50"
            >
              Tentar outro e-mail
            </button>
          </div>
        ) : (
          <>
            <p className="mt-3 leading-6 text-zinc-400">
              Informe o e-mail da sua
              conta. Enviaremos um link
              seguro para você cadastrar
              uma nova senha.
            </p>

            <form
              onSubmit={enviarRecuperacao}
              className="mt-7 space-y-4"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-zinc-300"
                >
                  E-mail cadastrado
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(evento) =>
                    setEmail(
                      evento.target.value
                    )
                  }
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  required
                  disabled={carregando}
                  className="w-full rounded-2xl border border-white/10 bg-black p-4 outline-none transition focus:border-green-400/60 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-2xl bg-green-400 py-4 font-black text-black transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando
                  ? "Enviando..."
                  : "Enviar link de recuperação"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}