"use client"

import Link from "next/link"
import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import { supabase } from "../supabase"

type TipoConta = "cliente" | "lojista"

const VERSAO_DOCUMENTOS = "1.0"

export default function AceitarTermosPage() {
  const [userId, setUserId] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [tipoConta, setTipoConta] =
    useState<TipoConta>("cliente")

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

  const [carregando, setCarregando] =
    useState(true)

  const [salvando, setSalvando] =
    useState(false)

  useEffect(() => {
    let paginaAtiva = true

    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!paginaAtiva) return

      if (!user) {
        window.location.href = "/login"
        return
      }

      if (
        user.email ===
        "vemverapp@gmail.com"
      ) {
        window.location.href = "/admin"
        return
      }

      const tipoSalvo =
        user.user_metadata
          ?.tipo_conta === "cliente"
          ? "cliente"
          : "lojista"

      setUserId(user.id)
      setEmail(user.email || "")
      setTipoConta(tipoSalvo)
      setCarregando(false)
    }

    carregarUsuario()

    return () => {
      paginaAtiva = false
    }
  }, [])

  async function registrarAceite(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault()

    if (!maiorDeIdade) {
      alert(
        "Confirme que você possui 18 anos ou mais."
      )
      return
    }

    if (!aceitouTermos) {
      alert(
        "Você precisa aceitar os Termos de Uso."
      )
      return
    }

    if (!confirmouPrivacidade) {
      alert(
        "Confirme que leu a Política de Privacidade."
      )
      return
    }

    if (
      tipoConta === "lojista" &&
      !aceitouTermosLojista
    ) {
      alert(
        "Lojistas precisam aceitar os Termos do Lojista."
      )
      return
    }

    if (!userId) {
      alert(
        "Não foi possível identificar sua conta."
      )
      return
    }

    setSalvando(true)

    const documentosObrigatorios = [
      "termos_uso",
      "politica_privacidade",
      ...(tipoConta === "lojista"
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

      setSalvando(false)

      alert(
        "Não foi possível verificar os aceites. Tente novamente."
      )

      return
    }

    const documentosJaRegistrados =
      new Set(
        (aceitesExistentes || []).map(
          (aceite) =>
            String(aceite.documento)
        )
      )

    const novosAceites =
      documentosObrigatorios
        .filter(
          (documento) =>
            !documentosJaRegistrados.has(
              documento
            )
        )
        .map((documento) => ({
          user_id: userId,
          tipo_usuario: tipoConta,
          documento,
          versao: VERSAO_DOCUMENTOS,
          origem:
            "aceite_obrigatorio",
        }))

    if (novosAceites.length > 0) {
      const { error: inserirError } =
        await supabase
          .from("aceites_legais")
          .insert(novosAceites)

      if (inserirError) {
        console.error(
          "Erro ao registrar aceites:",
          inserirError
        )

        setSalvando(false)

        alert(
          "Não foi possível registrar sua concordância. Tente novamente."
        )

        return
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const metadataAtual =
      user?.user_metadata || {}

    const { error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          ...metadataAtual,
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
        },
      })

    if (metadataError) {
      console.error(
        "Erro ao atualizar cadastro:",
        metadataError
      )

      setSalvando(false)

      alert(
        "Os documentos foram registrados, mas não foi possível atualizar a conta. Entre novamente."
      )

      await supabase.auth.signOut()
      window.location.href = "/login"
      return
    }

    alert(
      "Documentos aceitos com sucesso!"
    )

    window.location.href =
      tipoConta === "cliente"
        ? "/cliente"
        : "/lojista"
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-400" />

          <p className="mt-4 font-bold text-zinc-300">
            Verificando sua conta...
          </p>
        </div>
      </main>
    )
  }

  const todosMarcados =
    maiorDeIdade &&
    aceitouTermos &&
    confirmouPrivacidade &&
    (tipoConta === "cliente" ||
      aceitouTermosLojista)

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-zinc-900 p-7 shadow-2xl sm:p-9">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-400/10 text-3xl">
          📋
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-green-300">
          Aceite obrigatório
        </p>

        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          Antes de continuar
        </h1>

        <p className="mt-3 leading-6 text-zinc-400">
          Confirme sua idade e leia os
          documentos aplicáveis à sua
          conta.
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
          <p className="text-zinc-500">
            Conta
          </p>

          <p className="mt-1 break-all font-bold text-white">
            {email}
          </p>

          <p className="mt-2 font-bold text-green-300">
            {tipoConta === "cliente"
              ? "Cliente"
              : "Lojista"}
          </p>
        </div>

        <form
          onSubmit={registrarAceite}
          className="mt-6 space-y-4"
        >
          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-green-400/30">
            <input
              type="checkbox"
              checked={maiorDeIdade}
              onChange={(evento) =>
                setMaiorDeIdade(
                  evento.target.checked
                )
              }
              disabled={salvando}
              className="mt-1 h-5 w-5 accent-green-400"
            />

            <span className="text-sm leading-6 text-zinc-300">
              Declaro que tenho{" "}
              <strong className="text-white">
                18 anos ou mais
              </strong>{" "}
              e capacidade para criar esta
              conta.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-green-400/30">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(evento) =>
                setAceitouTermos(
                  evento.target.checked
                )
              }
              disabled={salvando}
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

          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-green-400/30">
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
              disabled={salvando}
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
            <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-orange-400/20 bg-orange-400/5 p-4 transition hover:border-orange-400/40">
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
                disabled={salvando}
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

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-zinc-500">
            Versão dos documentos:{" "}
            {VERSAO_DOCUMENTOS}. A data,
            o usuário e os documentos
            aceitos serão registrados.
          </div>

          <button
            type="submit"
            disabled={
              salvando ||
              !todosMarcados
            }
            className="w-full rounded-2xl bg-green-400 py-4 font-black text-black transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {salvando
              ? "Registrando..."
              : "Concordar e continuar"}
          </button>
        </form>
      </div>
    </main>
  )
}