"use client"

import Link from "next/link"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"

import { supabase } from "../supabase"

type TipoConta = "cliente" | "lojista"

const VERSAO_DOCUMENTOS = "1.0"

export default function LoginPage() {
  const [email, setEmail] =
    useState("")

  const [senha, setSenha] =
    useState("")

  const [tipoConta, setTipoConta] =
    useState<TipoConta>("cliente")

  const [carregando, setCarregando] =
    useState(false)

  const [mostrarSenha, setMostrarSenha] =
    useState(false)

  const [modoCadastro, setModoCadastro] =
    useState(false)

  const [maiorDeIdade, setMaiorDeIdade] =
    useState(false)

  const [aceitouTermos, setAceitouTermos] =
    useState(false)

  const [
    confirmouPrivacidade,
    setConfirmouPrivacidade,
  ] = useState(false)

  const [
    aceitouTermosLojista,
    setAceitouTermosLojista,
  ] = useState(false)

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
      alert(
        "A senha precisa ter pelo menos 6 caracteres."
      )
      return false
    }

    return true
  }

  function validarCadastroLegal() {
    if (!maiorDeIdade) {
      alert(
        "Confirme que você possui 18 anos ou mais."
      )
      return false
    }

    if (!aceitouTermos) {
      alert(
        "Você precisa aceitar os Termos de Uso."
      )
      return false
    }

    if (!confirmouPrivacidade) {
      alert(
        "Confirme que leu a Política de Privacidade."
      )
      return false
    }

    if (
      tipoConta === "lojista" &&
      !aceitouTermosLojista
    ) {
      alert(
        "Lojistas precisam aceitar os Termos do Lojista."
      )
      return false
    }

    return true
  }

  function possuiAceitesAtuais(
    metadata: Record<string, unknown>,
    tipo: TipoConta
  ) {
    const aceiteGeralValido =
      metadata?.maior_18_confirmado ===
        true &&
      metadata?.termos_uso_versao ===
        VERSAO_DOCUMENTOS &&
      metadata
        ?.politica_privacidade_versao ===
        VERSAO_DOCUMENTOS

    if (!aceiteGeralValido) {
      return false
    }

    if (tipo === "lojista") {
      return (
        metadata
          ?.termos_lojista_versao ===
        VERSAO_DOCUMENTOS
      )
    }

    return true
  }

  async function sincronizarAceites(
    userId: string,
    tipo: TipoConta
  ) {
    const documentosObrigatorios = [
      "termos_uso",
      "politica_privacidade",
      ...(tipo === "lojista"
        ? ["termos_lojista"]
        : []),
    ]

    const {
      data: aceitesExistentes,
      error: consultaError,
    } = await supabase
      .from("aceites_legais")
      .select("documento")
      .eq("user_id", userId)
      .eq("versao", VERSAO_DOCUMENTOS)

    if (consultaError) {
      console.error(
        "Erro ao consultar aceites:",
        consultaError
      )
      return false
    }

    const documentosRegistrados =
      new Set(
        (aceitesExistentes || []).map(
          (aceite) =>
            String(aceite.documento)
        )
      )

    const registrosPendentes =
      documentosObrigatorios
        .filter(
          (documento) =>
            !documentosRegistrados.has(
              documento
            )
        )
        .map((documento) => ({
          user_id: userId,
          tipo_usuario: tipo,
          documento,
          versao: VERSAO_DOCUMENTOS,
          origem: "cadastro",
        }))

    if (registrosPendentes.length === 0) {
      return true
    }

    const { error: inserirError } =
      await supabase
        .from("aceites_legais")
        .insert(registrosPendentes)

    if (inserirError) {
      console.error(
        "Erro ao sincronizar aceites:",
        inserirError
      )
      return false
    }

    return true
  }

  async function direcionarUsuario(
    user: User
  ) {
    if (
      user.email ===
      "vemverapp@gmail.com"
    ) {
      window.location.href = "/admin"
      return
    }

    const tipoSalvo: TipoConta =
      user.user_metadata
        ?.tipo_conta === "cliente"
        ? "cliente"
        : "lojista"

    const aceitesValidos =
      possuiAceitesAtuais(
        user.user_metadata || {},
        tipoSalvo
      )

    if (!aceitesValidos) {
      window.location.href =
        "/aceitar-termos"
      return
    }

    const sincronizou =
      await sincronizarAceites(
        user.id,
        tipoSalvo
      )

    if (!sincronizou) {
      setCarregando(false)

      alert(
        "Não foi possível confirmar os documentos aceitos. Tente novamente."
      )

      return
    }

    window.location.href =
      tipoSalvo === "cliente"
        ? "/cliente"
        : "/lojista"
  }

  async function fazerLogin() {
    if (!validarCampos()) return

    setCarregando(true)

    const { data, error } =
      await supabase.auth
        .signInWithPassword({
          email:
            email
              .trim()
              .toLowerCase(),
          password: senha,
        })

    if (error) {
      setCarregando(false)

      const mensagemErro =
        error.message.toLowerCase()

      const credenciaisIncorretas =
        mensagemErro.includes(
          "invalid login credentials"
        )

      alert(
        credenciaisIncorretas
          ? "E-mail ou senha incorretos. Confira os dados ou utilize a recuperação de senha."
          : "Não foi possível entrar agora. Tente novamente."
      )

      return
    }

    if (!data.user) {
      setCarregando(false)

      alert(
        "Não foi possível localizar sua conta."
      )

      return
    }

    await direcionarUsuario(data.user)
  }

  async function criarConta() {
    if (!validarCampos()) return
    if (!validarCadastroLegal()) return

    setCarregando(true)

    const emailFormatado =
      email.trim().toLowerCase()

    const metadataLegal = {
      tipo_conta: tipoConta,
      maior_18_confirmado: true,
      termos_uso_versao:
        VERSAO_DOCUMENTOS,
      politica_privacidade_versao:
        VERSAO_DOCUMENTOS,
      ...(tipoConta === "lojista"
        ? {
            termos_lojista_versao:
              VERSAO_DOCUMENTOS,
          }
        : {}),
    }

    const { data, error } =
      await supabase.auth.signUp({
        email: emailFormatado,
        password: senha,
        options: {
          data: metadataLegal,
        },
      })

    if (error) {
      setCarregando(false)

      alert(
        "Erro ao criar conta: " +
          error.message
      )

      return
    }

    if (!data.session || !data.user) {
      setCarregando(false)

      alert(
        "Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login."
      )

      setModoCadastro(false)
      return
    }

    const sincronizou =
      await sincronizarAceites(
        data.user.id,
        tipoConta
      )

    if (!sincronizou) {
      setCarregando(false)

      alert(
        "A conta foi criada, mas não foi possível registrar os documentos. Entre novamente para concluir."
      )

      await supabase.auth.signOut()
      return
    }

    await direcionarUsuario(data.user)
  }

  function cancelarCadastro() {
    if (carregando) return

    setModoCadastro(false)
    setMaiorDeIdade(false)
    setAceitouTermos(false)
    setConfirmouPrivacidade(false)
    setAceitouTermosLojista(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        <button
          type="button"
          onClick={() =>
            (window.location.href = "/")
          }
          className="mb-6 text-sm font-bold text-green-300"
        >
          ← Voltar para o VemVer
        </button>

        <h1 className="text-4xl font-black">
          {modoCadastro
            ? "Criar conta"
            : "Bem-vindo"}
        </h1>

        <p className="mt-2 text-zinc-400">
          {modoCadastro
            ? "Preencha os dados e confirme os documentos."
            : "Entre ou crie sua conta no VemVer."}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-black p-2">
          <button
            type="button"
            onClick={() =>
              setTipoConta("cliente")
            }
            disabled={carregando}
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
            onClick={() =>
              setTipoConta("lojista")
            }
            disabled={carregando}
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
                Quero encontrar lojas e
                produtos
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Salve favoritos, avalie
                lojas e receba
                recomendações.
              </p>
            </>
          ) : (
            <>
              <p className="font-black text-orange-300">
                Quero divulgar meu negócio
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                Cadastre sua loja, produtos
                e aumente sua visibilidade.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(evento) =>
              setEmail(evento.target.value)
            }
            placeholder="Seu e-mail"
            autoComplete="email"
            disabled={carregando}
            className="w-full rounded-2xl border border-white/10 bg-black p-4 outline-none transition focus:border-green-400/60 disabled:opacity-60"
          />

          <div className="relative">
            <input
              type={
                mostrarSenha
                  ? "text"
                  : "password"
              }
              value={senha}
              onChange={(evento) =>
                setSenha(
                  evento.target.value
                )
              }
              placeholder={
                modoCadastro
                  ? "Crie sua senha"
                  : "Sua senha"
              }
              autoComplete={
                modoCadastro
                  ? "new-password"
                  : "current-password"
              }
              disabled={carregando}
              onKeyDown={(evento) => {
                if (
                  evento.key === "Enter"
                ) {
                  if (modoCadastro) {
                    criarConta()
                  } else {
                    fazerLogin()
                  }
                }
              }}
              className="w-full rounded-2xl border border-white/10 bg-black p-4 pr-14 outline-none transition focus:border-green-400/60 disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() =>
                setMostrarSenha(
                  (valor) => !valor
                )
              }
              aria-label={
                mostrarSenha
                  ? "Ocultar senha"
                  : "Mostrar senha"
              }
              aria-pressed={mostrarSenha}
              title={
                mostrarSenha
                  ? "Ocultar senha"
                  : "Mostrar senha"
              }
              disabled={carregando}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400 transition hover:text-white disabled:opacity-50"
            >
              {mostrarSenha
                ? "🙈"
                : "👁️"}
            </button>
          </div>

          {!modoCadastro && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  (window.location.href =
                    "/recuperar-senha")
                }
                disabled={carregando}
                className="text-sm font-bold text-green-300 transition hover:text-green-200 disabled:opacity-50"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          {modoCadastro && (
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  checked={maiorDeIdade}
                  onChange={(evento) =>
                    setMaiorDeIdade(
                      evento.target.checked
                    )
                  }
                  disabled={carregando}
                  className="mt-1 h-5 w-5 accent-green-400"
                />

                <span className="text-sm leading-6 text-zinc-300">
                  Declaro que tenho{" "}
                  <strong className="text-white">
                    18 anos ou mais
                  </strong>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(evento) =>
                    setAceitouTermos(
                      evento.target.checked
                    )
                  }
                  disabled={carregando}
                  className="mt-1 h-5 w-5 accent-green-400"
                />

                <span className="text-sm leading-6 text-zinc-300">
                  Li e aceito os{" "}
                  <Link
                    href="/termos"
                    target="_blank"
                    rel="noreferrer"
                    className="font-black text-green-300 underline"
                  >
                    Termos de Uso
                  </Link>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  checked={
                    confirmouPrivacidade
                  }
                  onChange={(evento) =>
                    setConfirmouPrivacidade(
                      evento.target.checked
                    )
                  }
                  disabled={carregando}
                  className="mt-1 h-5 w-5 accent-green-400"
                />

                <span className="text-sm leading-6 text-zinc-300">
                  Li e estou ciente da{" "}
                  <Link
                    href="/privacidade"
                    target="_blank"
                    rel="noreferrer"
                    className="font-black text-green-300 underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>

              {tipoConta === "lojista" && (
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-orange-400/20 bg-orange-400/5 p-4">
                  <input
                    type="checkbox"
                    checked={
                      aceitouTermosLojista
                    }
                    onChange={(evento) =>
                      setAceitouTermosLojista(
                        evento.target.checked
                      )
                    }
                    disabled={carregando}
                    className="mt-1 h-5 w-5 accent-orange-400"
                  />

                  <span className="text-sm leading-6 text-zinc-300">
                    Li e aceito os{" "}
                    <Link
                      href="/termos-lojista"
                      target="_blank"
                      rel="noreferrer"
                      className="font-black text-orange-300 underline"
                    >
                      Termos do Lojista
                    </Link>
                    .
                  </span>
                </label>
              )}
            </div>
          )}

          {!modoCadastro ? (
            <>
              <button
                type="button"
                onClick={fazerLogin}
                disabled={carregando}
                className="w-full rounded-2xl bg-green-400 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando
                  ? "Aguarde..."
                  : "Entrar"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setModoCadastro(true)
                }
                disabled={carregando}
                className="w-full rounded-2xl border border-white/20 py-4 font-bold transition hover:border-green-400/50 disabled:opacity-50"
              >
                {tipoConta === "cliente"
                  ? "Criar conta de cliente"
                  : "Criar conta de lojista"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={criarConta}
                disabled={carregando}
                className={`w-full rounded-2xl py-4 font-black text-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  tipoConta === "lojista"
                    ? "bg-orange-400 hover:bg-orange-300"
                    : "bg-green-400 hover:bg-green-300"
                }`}
              >
                {carregando
                  ? "Criando conta..."
                  : tipoConta === "cliente"
                    ? "Confirmar conta de cliente"
                    : "Confirmar conta de lojista"}
              </button>

              <button
                type="button"
                onClick={cancelarCadastro}
                disabled={carregando}
                className="w-full rounded-2xl border border-white/20 py-4 font-bold transition hover:border-white/40 disabled:opacity-50"
              >
                Já tenho conta
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-zinc-500">
          Consulte os{" "}
          <Link
            href="/termos"
            className="underline hover:text-zinc-300"
          >
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            className="underline hover:text-zinc-300"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </main>
  )
}