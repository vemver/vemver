"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../supabase"

export default function AvaliarLoja({
  lojaId,
}: {
  lojaId: number
}) {
  const [nome, setNome] = useState("")
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState("")
  const [avaliacaoId, setAvaliacaoId] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState(false)

  useEffect(() => {
    carregarAvaliacao()
  }, [lojaId])

  async function carregarAvaliacao() {
    setCarregando(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUsuarioLogado(false)
      setCarregando(false)
      return
    }

    setUsuarioLogado(true)

    const nomeUsuario =
      user.user_metadata?.nome ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      ""

    setNome(nomeUsuario)

    const { data, error } = await supabase
      .from("avaliacoes")
      .select("id, nome_cliente, nota, comentario")
      .eq("loja_id", lojaId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("Erro ao carregar avaliação:", error)
      setCarregando(false)
      return
    }

    if (data) {
      setAvaliacaoId(data.id)
      setNome(data.nome_cliente || nomeUsuario)
      setNota(Number(data.nota || 5))
      setComentario(data.comentario || "")
    }

    setCarregando(false)
  }

  async function enviarAvaliacao() {
    if (enviando) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const entrar = confirm(
        "Você precisa entrar como cliente para avaliar. Deseja ir para o login?"
      )

      if (entrar) {
        window.location.href = "/login"
      }

      return
    }

    if (!nome.trim()) {
      alert("Digite seu nome.")
      return
    }

    if (nota < 1 || nota > 5) {
      alert("Escolha uma nota entre 1 e 5.")
      return
    }

    if (comentario.trim().length < 3) {
      alert("Escreva um comentário com pelo menos 3 caracteres.")
      return
    }

    setEnviando(true)

    const dadosAvaliacao = {
      loja_id: lojaId,
      user_id: user.id,
      nome_cliente: nome.trim(),
      nota,
      comentario: comentario.trim(),
      aprovado: true,
    }

    if (avaliacaoId) {
      const { error } = await supabase
        .from("avaliacoes")
        .update(dadosAvaliacao)
        .eq("id", avaliacaoId)
        .eq("user_id", user.id)

      setEnviando(false)

      if (error) {
        console.error("Erro ao editar avaliação:", error)
        alert("Não foi possível atualizar sua avaliação.")
        return
      }

      alert("Avaliação atualizada com sucesso!")
      window.location.reload()
      return
    }

    const { data, error } = await supabase
      .from("avaliacoes")
      .insert(dadosAvaliacao)
      .select("id")
      .single()

    setEnviando(false)

    if (error) {
      console.error("Erro ao enviar avaliação:", error)

      if (error.code === "23505") {
        alert("Você já avaliou esta loja. Atualize a página para editar.")
      } else {
        alert("Não foi possível enviar sua avaliação.")
      }

      return
    }

    setAvaliacaoId(data.id)
    alert("Avaliação enviada com sucesso!")
    window.location.reload()
  }

  if (carregando) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="font-bold text-zinc-400">
          Carregando avaliação...
        </p>
      </div>
    )
  }

  if (!usuarioLogado) {
    return (
      <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6">
        <h3 className="text-2xl font-black">
          Avalie esta loja
        </h3>

        <p className="mt-3 text-zinc-400">
          Entre com sua conta de cliente para publicar uma avaliação.
        </p>

        <button
          type="button"
          onClick={() => (window.location.href = "/login")}
          className="mt-5 rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black"
        >
          Entrar para avaliar
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-2xl font-black">
        {avaliacaoId ? "Editar minha avaliação" : "Avaliar loja"}
      </h3>

      {avaliacaoId && (
        <p className="mt-2 text-sm font-bold text-green-300">
          Você já avaliou esta loja e pode alterar sua opinião.
        </p>
      )}

      <label className="mt-6 block text-sm font-bold text-zinc-400">
        Seu nome
      </label>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome"
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-4 outline-none focus:border-yellow-400/50"
      />

      <label className="mt-5 block text-sm font-bold text-zinc-400">
        Sua nota
      </label>

      <select
        value={nota}
        onChange={(e) => setNota(Number(e.target.value))}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-yellow-400/50"
      >
        <option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
        <option value={4}>⭐⭐⭐⭐ Muito bom</option>
        <option value={3}>⭐⭐⭐ Bom</option>
        <option value={2}>⭐⭐ Regular</option>
        <option value={1}>⭐ Ruim</option>
      </select>

      <label className="mt-5 block text-sm font-bold text-zinc-400">
        Comentário
      </label>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Conte como foi sua experiência com esta loja"
        maxLength={500}
        className="mt-2 h-32 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-4 outline-none focus:border-yellow-400/50"
      />

      <p className="mt-2 text-right text-xs text-zinc-500">
        {comentario.length}/500
      </p>

      <button
        type="button"
        onClick={enviarAvaliacao}
        disabled={enviando}
        className="mt-4 rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando
          ? "Salvando..."
          : avaliacaoId
          ? "Salvar alteração"
          : "Enviar avaliação"}
      </button>
    </div>
  )
}