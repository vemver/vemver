"use client"

import { useEffect, useMemo, useState } from "react"

type ImagemProduto = {
  id?: number
  imagem_url: string
  principal?: boolean
  ordem?: number
}

type GaleriaProdutoProps = {
  imagens: ImagemProduto[]
  imagemFallback?: string | null
  nomeProduto: string
}

export default function GaleriaProduto({
  imagens,
  imagemFallback,
  nomeProduto,
}: GaleriaProdutoProps) {
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [telaCheia, setTelaCheia] = useState(false)
  const [zoomAtivo, setZoomAtivo] = useState(false)
  const [inicioToque, setInicioToque] = useState<number | null>(
    null
  )

  const imagensDisponiveis = useMemo(() => {
    const imagensValidas = imagens
      .filter((imagem) => Boolean(imagem.imagem_url))
      .sort((a, b) => {
        if (a.principal && !b.principal) return -1
        if (!a.principal && b.principal) return 1

        return Number(a.ordem || 0) - Number(b.ordem || 0)
      })

    const fallbackJaExiste = imagensValidas.some(
      (imagem) => imagem.imagem_url === imagemFallback
    )

    if (imagemFallback && !fallbackJaExiste) {
      imagensValidas.push({
        id: -1,
        imagem_url: imagemFallback,
        principal: imagensValidas.length === 0,
        ordem: imagensValidas.length,
      })
    }

    return imagensValidas
  }, [imagens, imagemFallback])

  const imagemAtual =
    imagensDisponiveis[indiceAtual]?.imagem_url || ""

  const possuiVariasImagens = imagensDisponiveis.length > 1

  useEffect(() => {
    if (indiceAtual >= imagensDisponiveis.length) {
      setIndiceAtual(0)
    }
  }, [imagensDisponiveis.length, indiceAtual])

  useEffect(() => {
    function controlarTeclado(evento: KeyboardEvent) {
      if (evento.key === "ArrowLeft") {
        imagemAnterior()
      }

      if (evento.key === "ArrowRight") {
        proximaImagem()
      }

      if (evento.key === "Escape") {
        setTelaCheia(false)
        setZoomAtivo(false)
      }
    }

    window.addEventListener("keydown", controlarTeclado)

    return () => {
      window.removeEventListener("keydown", controlarTeclado)
    }
  }, [imagensDisponiveis.length])

  function selecionarImagem(indice: number) {
    setIndiceAtual(indice)
    setZoomAtivo(false)
  }

  function imagemAnterior() {
    if (!possuiVariasImagens) return

    setIndiceAtual((indiceAnterior) =>
      indiceAnterior === 0
        ? imagensDisponiveis.length - 1
        : indiceAnterior - 1
    )

    setZoomAtivo(false)
  }

  function proximaImagem() {
    if (!possuiVariasImagens) return

    setIndiceAtual((indiceAnterior) =>
      indiceAnterior === imagensDisponiveis.length - 1
        ? 0
        : indiceAnterior + 1
    )

    setZoomAtivo(false)
  }

  function iniciarToque(evento: React.TouchEvent) {
    setInicioToque(evento.touches[0].clientX)
  }

  function finalizarToque(evento: React.TouchEvent) {
    if (inicioToque === null) return

    const fimToque = evento.changedTouches[0].clientX
    const distancia = inicioToque - fimToque

    if (distancia > 50) {
      proximaImagem()
    }

    if (distancia < -50) {
      imagemAnterior()
    }

    setInicioToque(null)
  }

  function abrirTelaCheia() {
    if (!imagemAtual) return

    setTelaCheia(true)
    setZoomAtivo(false)
  }

  function fecharTelaCheia() {
    setTelaCheia(false)
    setZoomAtivo(false)
  }

  if (imagensDisponiveis.length === 0) {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900">
        <div className="flex h-[520px] items-center justify-center text-center text-zinc-500">
          <div>
            <div className="text-6xl">📷</div>

            <p className="mt-4 font-bold">
              Produto sem imagens
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section>
        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white"
          onTouchStart={iniciarToque}
          onTouchEnd={finalizarToque}
        >
          <button
            type="button"
            onClick={abrirTelaCheia}
            className="group flex h-[420px] w-full items-center justify-center overflow-hidden md:h-[520px]"
            aria-label="Abrir imagem em tela cheia"
          >
            <img
              src={imagemAtual}
              alt={`${nomeProduto} — imagem ${indiceAtual + 1}`}
              loading="eager"
              className={`h-full w-full object-contain transition duration-300 ${
                zoomAtivo
                  ? "scale-150 cursor-zoom-out"
                  : "scale-100 cursor-zoom-in group-hover:scale-[1.03]"
              }`}
            />
          </button>

          {possuiVariasImagens && (
            <>
              <button
                type="button"
                onClick={(evento) => {
                  evento.stopPropagation()
                  imagemAnterior()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-4 py-3 text-2xl font-black text-white backdrop-blur transition hover:bg-black"
                aria-label="Imagem anterior"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(evento) => {
                  evento.stopPropagation()
                  proximaImagem()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-4 py-3 text-2xl font-black text-white backdrop-blur transition hover:bg-black"
                aria-label="Próxima imagem"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            {indiceAtual + 1}/{imagensDisponiveis.length}
          </div>

          <button
            type="button"
            onClick={(evento) => {
              evento.stopPropagation()
              abrirTelaCheia()
            }}
            className="absolute right-4 top-4 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-black"
          >
            ⛶ Tela cheia
          </button>
        </div>

        {imagensDisponiveis.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-3">
            {imagensDisponiveis.map((imagem, indice) => (
              <button
                key={
                  imagem.id ||
                  `${imagem.imagem_url}-${indice}`
                }
                type="button"
                onClick={() => selecionarImagem(indice)}
                className={`relative min-w-[88px] overflow-hidden rounded-2xl border-2 bg-white transition ${
                  indiceAtual === indice
                    ? "border-green-400 shadow-lg shadow-green-500/20"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={imagem.imagem_url}
                  alt={`${nomeProduto} — miniatura ${indice + 1}`}
                  loading="lazy"
                  className="h-20 w-24 object-cover"
                />

                {imagem.principal && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-green-400 px-2 py-1 text-[9px] font-black text-black">
                    PRINCIPAL
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
          <p>
            Clique na imagem para ampliar.
          </p>

          {possuiVariasImagens && (
            <p>
              Use as setas ou deslize no celular.
            </p>
          )}
        </div>
      </section>

      {telaCheia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur"
          onTouchStart={iniciarToque}
          onTouchEnd={finalizarToque}
        >
          <button
            type="button"
            onClick={fecharTelaCheia}
            className="absolute right-5 top-5 z-20 rounded-full bg-white/10 px-5 py-3 text-lg font-black text-white transition hover:bg-white/20"
          >
            ✕ Fechar
          </button>

          <button
            type="button"
            onClick={() => setZoomAtivo((estado) => !estado)}
            className="absolute left-5 top-5 z-20 rounded-full bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
          >
            {zoomAtivo ? "− Remover zoom" : "+ Aplicar zoom"}
          </button>

          {possuiVariasImagens && (
            <>
              <button
                type="button"
                onClick={imagemAnterior}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 px-5 py-4 text-4xl font-black text-white transition hover:bg-white/20"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={proximaImagem}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 px-5 py-4 text-4xl font-black text-white transition hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}

          <div className="flex h-full w-full items-center justify-center overflow-auto">
            <img
              src={imagemAtual}
              alt={`${nomeProduto} ampliado`}
              className={`max-h-[90vh] max-w-[95vw] object-contain transition duration-300 ${
                zoomAtivo
                  ? "scale-150 cursor-zoom-out"
                  : "scale-100 cursor-zoom-in"
              }`}
              onClick={() =>
                setZoomAtivo((estado) => !estado)
              }
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-5 py-2 font-bold text-white backdrop-blur">
            {indiceAtual + 1}/{imagensDisponiveis.length}
          </div>
        </div>
      )}
    </>
  )
}