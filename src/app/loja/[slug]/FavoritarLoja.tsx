"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../supabase"

export default function FavoritarLoja({
  lojaId,
}: {
  lojaId: number
}) {
  const [favoritado, setFavoritado] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    verificar()
  }, [lojaId])

  async function verificar() {
    setCarregando(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setFavoritado(false)
      setCarregando(false)
      return
    }

    const { data, error } = await supabase
      .from("favoritos")
      .select("id")
      .eq("loja_id", lojaId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("Erro ao verificar favorito:", error)
      setCarregando(false)
      return
    }

    setFavoritado(Boolean(data))
    setCarregando(false)
  }

  async function alternarFavorito() {
    if (processando) return

    setProcessando(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setProcessando(false)

      const desejaEntrar = confirm(
        "Você precisa entrar como cliente para favoritar. Deseja ir para o login?"
      )

      if (desejaEntrar) {
        window.location.href = "/login"
      }

      return
    }

    if (favoritado) {
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("loja_id", lojaId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Erro ao remover favorito:", error)
        alert("Não foi possível remover esta loja dos favoritos.")
        setProcessando(false)
        return
      }

      setFavoritado(false)
      setProcessando(false)
      return
    }

    const { error } = await supabase
      .from("favoritos")
      .insert({
        loja_id: lojaId,
        produto_id: null,
        user_id: user.id,
      })

    if (error) {
      console.error("Erro ao adicionar favorito:", error)

      if (error.code === "23505") {
        setFavoritado(true)
      } else {
        alert("Não foi possível adicionar esta loja aos favoritos.")
      }

      setProcessando(false)
      return
    }

    setFavoritado(true)
    setProcessando(false)
  }

  if (carregando) {
    return (
      <button
        type="button"
        disabled
        className="rounded-2xl border border-white/20 px-8 py-4 font-black text-zinc-500 opacity-60"
      >
        Carregando...
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={alternarFavorito}
      disabled={processando}
      className={`rounded-2xl px-8 py-4 font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
        favoritado
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
          : "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
      }`}
    >
      {processando
        ? "Aguarde..."
        : favoritado
        ? "❤️ Favoritada"
        : "🤍 Favoritar"}
    </button>
  )
}