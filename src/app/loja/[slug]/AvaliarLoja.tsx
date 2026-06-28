"use client"

import { useState } from "react"
import { supabase } from "../../supabase"

export default function AvaliarLoja({
  lojaId,
}: {
  lojaId: number
}) {
  const [nome, setNome] = useState("")
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function enviarAvaliacao() {
    if (!nome) {
      alert("Digite seu nome")
      return
    }

    setEnviando(true)

    const { error } = await supabase
      .from("avaliacoes")
      .insert({
        loja_id: lojaId,
        nome_cliente: nome,
        nota,
        comentario,
      })

    setEnviando(false)

    if (error) {
      alert("Erro ao enviar avaliação")
      return
    }

    alert("Avaliação enviada com sucesso!")

    setNome("")
    setNota(5)
    setComentario("")

    window.location.reload()
  }

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-2xl font-black">
        Avaliar loja
      </h3>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome"
        className="mt-4 w-full rounded-xl bg-black/40 p-4"
      />

      <select
        value={nota}
        onChange={(e) => setNota(Number(e.target.value))}
        className="mt-4 w-full rounded-xl bg-black/40 p-4"
      >
        <option value={5}>⭐⭐⭐⭐⭐</option>
        <option value={4}>⭐⭐⭐⭐</option>
        <option value={3}>⭐⭐⭐</option>
        <option value={2}>⭐⭐</option>
        <option value={1}>⭐</option>
      </select>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Comentário"
        className="mt-4 h-32 w-full rounded-xl bg-black/40 p-4"
      />

      <button
        onClick={enviarAvaliacao}
        disabled={enviando}
        className="mt-4 rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black"
      >
        {enviando ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  )
}