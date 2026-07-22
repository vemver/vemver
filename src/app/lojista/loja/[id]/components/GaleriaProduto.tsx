"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { supabase } from "../../../../supabase"

type GaleriaProdutoProps = {
  produtoId: number
  limiteImagens?: number
  aoAtualizarImagemPrincipal?: (imagemUrl: string) => void
}

type ImagemProduto = {
  id: number
  produto_id: number
  imagem_url: string
  ordem: number
  principal: boolean
  created_at?: string
}

export default function GaleriaProduto({
  produtoId,
  limiteImagens = 6,
  aoAtualizarImagemPrincipal,
}: GaleriaProdutoProps) {
  const [imagens, setImagens] = useState<ImagemProduto[]>([])
  const [arquivos, setArquivos] = useState<File[]>([])
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarImagens()
  }, [produtoId])

  async function carregarImagens() {
    setCarregando(true)

    const { data, error } = await supabase
      .from("produto_imagens")
      .select("*")
      .eq("produto_id", produtoId)
      .order("principal", { ascending: false })
      .order("ordem", { ascending: true })
      .order("id", { ascending: true })

    if (error) {
      console.error("Erro ao carregar galeria:", error)
      setCarregando(false)
      return
    }

    setImagens(data || [])
    setCarregando(false)
  }

  function selecionarArquivos(evento: ChangeEvent<HTMLInputElement>) {
    const selecionados = Array.from(evento.target.files || [])

    if (selecionados.length === 0) return

    const vagasDisponiveis =
      limiteImagens - imagens.length

    if (vagasDisponiveis <= 0) {
      alert(
        `Este produto já atingiu o limite de ${limiteImagens} imagens.`
      )

      evento.target.value = ""
      return
    }

    const imagensValidas = selecionados.filter((arquivo) =>
      arquivo.type.startsWith("image/")
    )

    if (imagensValidas.length !== selecionados.length) {
      alert("Somente arquivos de imagem são permitidos.")
    }

    const arquivosPermitidos = imagensValidas.slice(
      0,
      vagasDisponiveis
    )

    if (imagensValidas.length > vagasDisponiveis) {
      alert(
        `Você pode adicionar somente mais ${vagasDisponiveis} imagem(ns).`
      )
    }

    setArquivos(arquivosPermitidos)
    evento.target.value = ""
  }

  function removerArquivoSelecionado(indice: number) {
    setArquivos((listaAtual) =>
      listaAtual.filter((_, index) => index !== indice)
    )
  }

  async function enviarImagens() {
    if (arquivos.length === 0 || enviando) return

    const quantidadeFinal =
      imagens.length + arquivos.length

    if (quantidadeFinal > limiteImagens) {
      alert(
        `O limite é de ${limiteImagens} imagens por produto.`
      )
      return
    }

    setEnviando(true)

    try {
      let proximaOrdem =
        imagens.length > 0
          ? Math.max(
              ...imagens.map((imagem) =>
                Number(imagem.ordem || 0)
              )
            ) + 1
          : 0

      const novasImagens: {
        produto_id: number
        imagem_url: string
        ordem: number
        principal: boolean
      }[] = []

      for (const arquivo of arquivos) {
        const nomeSeguro = arquivo.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        )

        const caminhoArquivo =
          `produtos/${produtoId}/` +
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}-${nomeSeguro}`

        const { error: uploadError } =
          await supabase.storage
            .from("lojas")
            .upload(caminhoArquivo, arquivo)

        if (uploadError) {
          throw uploadError
        }

        const { data: urlData } = supabase.storage
          .from("lojas")
          .getPublicUrl(caminhoArquivo)

        novasImagens.push({
          produto_id: produtoId,
          imagem_url: urlData.publicUrl,
          ordem: proximaOrdem,
          principal:
            imagens.length === 0 &&
            novasImagens.length === 0,
        })

        proximaOrdem += 1
      }

      const { data: imagensSalvas, error: insertError } =
        await supabase
          .from("produto_imagens")
          .insert(novasImagens)
          .select("*")

      if (insertError) {
        throw insertError
      }

      const novaPrincipal = imagensSalvas?.find(
        (imagem) => imagem.principal === true
      )

      if (novaPrincipal) {
        const { error: produtoError } = await supabase
          .from("produtos")
          .update({
            imagem_url: novaPrincipal.imagem_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", produtoId)

        if (produtoError) {
          throw produtoError
        }

        aoAtualizarImagemPrincipal?.(
          novaPrincipal.imagem_url
        )
      }

      setArquivos([])
      await carregarImagens()

      alert("Imagens adicionadas com sucesso!")
    } catch (error) {
      console.error("Erro ao enviar galeria:", error)
      alert("Não foi possível enviar todas as imagens.")
    } finally {
      setEnviando(false)
    }
  }

  async function definirComoPrincipal(
    imagem: ImagemProduto
  ) {
    if (imagem.principal) return

    const { error: removerPrincipalError } =
      await supabase
        .from("produto_imagens")
        .update({ principal: false })
        .eq("produto_id", produtoId)

    if (removerPrincipalError) {
      console.error(removerPrincipalError)
      alert("Erro ao alterar a imagem principal.")
      return
    }

    const { error: definirPrincipalError } =
      await supabase
        .from("produto_imagens")
        .update({ principal: true })
        .eq("id", imagem.id)

    if (definirPrincipalError) {
      console.error(definirPrincipalError)
      alert("Erro ao definir a imagem principal.")
      return
    }

    const { error: produtoError } = await supabase
      .from("produtos")
      .update({
        imagem_url: imagem.imagem_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", produtoId)

    if (produtoError) {
      console.error(produtoError)
      alert(
        "A galeria foi atualizada, mas ocorreu um erro ao atualizar o produto."
      )
      return
    }

    aoAtualizarImagemPrincipal?.(imagem.imagem_url)
    await carregarImagens()
  }

  async function excluirImagem(
    imagem: ImagemProduto
  ) {
    const confirmar = confirm(
      "Deseja excluir esta imagem da galeria?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("produto_imagens")
      .delete()
      .eq("id", imagem.id)

    if (error) {
      console.error("Erro ao excluir imagem:", error)
      alert("Não foi possível excluir a imagem.")
      return
    }

    const imagensRestantes = imagens.filter(
      (item) => item.id !== imagem.id
    )

    if (imagem.principal) {
      const novaPrincipal = imagensRestantes[0]

      if (novaPrincipal) {
        await supabase
          .from("produto_imagens")
          .update({ principal: true })
          .eq("id", novaPrincipal.id)

        await supabase
          .from("produtos")
          .update({
            imagem_url: novaPrincipal.imagem_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", produtoId)

        aoAtualizarImagemPrincipal?.(
          novaPrincipal.imagem_url
        )
      } else {
        await supabase
          .from("produtos")
          .update({
            imagem_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", produtoId)

        aoAtualizarImagemPrincipal?.("")
      }
    }

    await carregarImagens()
  }

  if (carregando) {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
        <p className="font-bold text-zinc-400">
          Carregando imagens...
        </p>
      </div>
    )
  }

  const vagasDisponiveis =
    limiteImagens - imagens.length

  return (
    <section className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black">
            📸 Galeria do produto
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            Adicione até {limiteImagens} imagens e escolha
            qual será exibida como principal.
          </p>
        </div>

        <span className="rounded-full bg-purple-500/15 px-4 py-2 text-sm font-bold text-purple-300">
          {imagens.length}/{limiteImagens} imagens
        </span>
      </div>

      {imagens.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imagens.map((imagem) => (
            <article
              key={imagem.id}
              className={`overflow-hidden rounded-3xl border ${
                imagem.principal
                  ? "border-green-400 bg-green-400/5"
                  : "border-white/10 bg-zinc-900"
              }`}
            >
              <img
                src={imagem.imagem_url}
                alt="Imagem do produto"
                className="h-48 w-full object-cover"
              />

              <div className="p-4">
                {imagem.principal && (
                  <span className="inline-block rounded-full bg-green-400 px-3 py-1 text-xs font-black text-black">
                    FOTO PRINCIPAL
                  </span>
                )}

                <div className="mt-4 grid gap-2">
                  {!imagem.principal && (
                    <button
                      type="button"
                      onClick={() =>
                        definirComoPrincipal(imagem)
                      }
                      className="rounded-2xl bg-green-400 px-4 py-3 font-black text-black"
                    >
                      Tornar principal
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => excluirImagem(imagem)}
                    className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-bold text-red-300"
                  >
                    Excluir imagem
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-zinc-900 p-8 text-center text-zinc-400">
          Este produto ainda não possui imagens na galeria.
        </div>
      )}

      {vagasDisponiveis > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-bold text-zinc-400">
            Selecionar novas imagens
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={selecionarArquivos}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-5"
          />

          <p className="mt-2 text-xs text-zinc-500">
            Você ainda pode adicionar {vagasDisponiveis} imagem(ns).
          </p>
        </div>
      )}

      {arquivos.length > 0 && (
        <div className="mt-6">
          <h4 className="font-black">
            Imagens selecionadas
          </h4>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {arquivos.map((arquivo, indice) => (
              <div
                key={`${arquivo.name}-${indice}`}
                className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900"
              >
                <img
                  src={URL.createObjectURL(arquivo)}
                  alt={arquivo.name}
                  className="h-40 w-full object-cover"
                />

                <div className="p-3">
                  <p className="truncate text-sm text-zinc-400">
                    {arquivo.name}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removerArquivoSelecionado(indice)
                    }
                    className="mt-3 w-full rounded-xl border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300"
                  >
                    Remover seleção
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={enviarImagens}
            disabled={enviando}
            className="mt-5 w-full rounded-2xl bg-purple-500 px-6 py-5 text-lg font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando
              ? "Enviando imagens..."
              : `Enviar ${arquivos.length} imagem(ns)`}
          </button>
        </div>
      )}
    </section>
  )
}