"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../supabase"

export default function FavoritarLoja({
  lojaId,
}: {
  lojaId: number
}) {
  const [favoritado, setFavoritado] = useState(false)

  async function verificar() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("favoritos")
      .select("*")
      .eq("loja_id", lojaId)
      .eq("user_id", user.id)
      .maybeSingle()

    setFavoritado(!!data)
  }

  async function alternarFavorito() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Faça login para favoritar.")
      return
    }

    if (favoritado) {
      await supabase
        .from("favoritos")
        .delete()
        .eq("loja_id", lojaId)
        .eq("user_id", user.id)

      setFavoritado(false)
    } else {
      await supabase
        .from("favoritos")
        .insert({
          loja_id: lojaId,
          user_id: user.id,
        })

      setFavoritado(true)
    }
  }

  useEffect(() => {
    verificar()
  }, [])

  return (
    <button
      onClick={alternarFavorito}
      className={`rounded-2xl px-8 py-4 font-black ${
        favoritado
          ? "bg-red-500 text-white"
          : "bg-white text-black"
      }`}
    >
      {favoritado ? "❤️ Favoritada" : "🤍 Favoritar"}
    </button>
  )
}