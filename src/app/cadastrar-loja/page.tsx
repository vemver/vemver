"use client"

import { useState } from "react"
import { supabase } from "../supabase"

export default function CadastrarLoja() {
  const [nome, setNome] = useState("")
  const [categoria, setCategoria] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [cidade, setCidade] = useState("")
  const [endereco, setEndereco] = useState("")
  const [descricao, setDescricao] = useState("")
  const [imagem, setImagem] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function cadastrarLoja() {
    setSalvando(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Faça login para cadastrar sua loja.")
      window.location.href = "/login"
      return
    }

  const { data: lojasDoUsuario } = await supabase
  .from("lojas")
  .select("id, plano, limite_lojas")
  .eq("user_id", user.id)

const planoAtual = lojasDoUsuario?.[0]?.plano || "gratis"
const limiteLojas = lojasDoUsuario?.[0]?.limite_lojas || 1
const totalLojas = lojasDoUsuario?.length || 0

if (totalLojas >= limiteLojas) {
  alert(
    `Seu plano atual (${planoAtual}) permite ${limiteLojas} loja(s). Para cadastrar outra unidade, solicite um plano multiunidade.`
  )
  window.location.href = "/lojista"
  return
}
    let imagemUrl = ""

    if (imagem) {
      const extensao = imagem.name.split(".").pop()
      const nomeArquivo = `${Date.now()}.${extensao}`

      const { error: uploadError } = await supabase.storage
        .from("lojas")
        .upload(nomeArquivo, imagem)

      if (uploadError) {
        alert("Erro ao enviar imagem")
        console.log(uploadError)
        setSalvando(false)
        return
      }

      const { data } = supabase.storage
        .from("lojas")
        .getPublicUrl(nomeArquivo)

      imagemUrl = data.publicUrl
    }

    const { error } = await supabase
      .from("lojas")
      .insert([
        {
          nome,
          categoria,
          whatsapp,
          cidade,
          endereco,
          descricao,
          imagem_url: imagemUrl,
          premium: false,
          ativo: false,
          status: "em_analise",
          user_id: user.id,
        },
      ])

    setSalvando(false)

    if (error) {
      alert("Erro ao cadastrar")
      console.log(error)
      return
    }

    alert(
      "Loja enviada para análise! Após aprovação do administrador ela aparecerá no VemVer."
    )

    window.location.href = "/lojista"
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-4xl font-black">
          Cadastrar Loja
        </h1>

        <p className="mt-2 text-zinc-400">
          Coloque sua loja no VemVer
        </p>

        <div className="mt-8 space-y-4">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da loja"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Categoria"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Endereço"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImagem(e.target.files[0])
              }
            }}
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          {imagem && (
            <img
              src={URL.createObjectURL(imagem)}
              className="mt-4 h-52 w-full rounded-2xl object-cover"
            />
          )}

          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da loja"
            className="w-full rounded-2xl bg-zinc-800 p-4 outline-none"
          />

          <button
            onClick={cadastrarLoja}
            disabled={salvando}
            className="w-full rounded-2xl bg-green-400 py-4 font-bold text-black disabled:opacity-50"
          >
            {salvando ? "Enviando..." : "Cadastrar loja"}
          </button>
        </div>
      </div>
    </main>
  )
}