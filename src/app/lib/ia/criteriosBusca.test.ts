import { describe, expect, it } from "vitest"

import type { IntencaoBusca } from "./entenderIntencao"
import {
  normalizarTexto,
  obterCriteriosBusca,
  obterTermosContextoBusca,
} from "./criteriosBusca"

function criarIntencao(
  sobrescritas: Partial<IntencaoBusca> = {}
): IntencaoBusca {
  return {
    termoBusca: "",
    categoria: null,
    termosRelacionados: [],
    termosContexto: [],
    delivery: null,
    abertoAgora: null,
    pertoDeMim: null,
    preco: null,
    ...sobrescritas,
  }
}

describe("normalizarTexto", () => {
  it("remove acentos, converte para minusculas e remove espacos externos", () => {
    expect(
      normalizarTexto("  Assistência Técnica  ")
    ).toBe("assistencia tecnica")
  })
})

describe("obterCriteriosBusca", () => {
  it("trata uma busca generica por loja sem criar criterios artificiais", () => {
    const intencao = criarIntencao({
      termoBusca: "loja",

      // Mesmo que a IA devolva expansoes,
      // uma busca generica nao deve ser
      // artificialmente restringida.
      categoria: "Tecnologia",
      termosRelacionados: [
        "comércio",
        "varejo",
        "eletrônicos",
      ],
      termosContexto: ["notebook"],
    })

    expect(
      obterCriteriosBusca(intencao)
    ).toEqual([])
  })

  it("remove palavras genericas mas preserva o conceito importante", () => {
    const intencao = criarIntencao({
      termoBusca: "loja de iphone",
    })

    expect(
      obterCriteriosBusca(intencao)
    ).toEqual(["iphone"])
  })

  it("mantem a expressao completa e tambem separa palavras significativas", () => {
    const intencao = criarIntencao({
      termoBusca: "iphone pro",
    })

    expect(
      obterCriteriosBusca(intencao)
    ).toEqual([
      "iphone pro",
      "iphone",
      "pro",
    ])
  })

  it("permite expansao semantica quando existe um termo principal significativo", () => {
    const intencao = criarIntencao({
      termoBusca: "assistência notebook",
      categoria: "Tecnologia",
      termosRelacionados: [
        "reparo",
        "informática",
        "eletrônicos",
      ],
      termosContexto: [
        "notebook",
        "computador",
      ],
    })

    const criterios =
      obterCriteriosBusca(intencao)

    expect(criterios).toEqual(
      expect.arrayContaining([
        "assistência notebook",
        "assistência",
        "notebook",
        "Tecnologia",
        "reparo",
        "informática",
        "eletrônicos",
        "computador",
      ])
    )
  })

  it("nao duplica criterios equivalentes depois da normalizacao", () => {
    const intencao = criarIntencao({
      termoBusca: "iphone",
      termosRelacionados: [
        "IPHONE",
        "iPhone",
      ],
    })

    const criterios =
      obterCriteriosBusca(intencao)

    expect(criterios).toHaveLength(1)

    expect(
      normalizarTexto(criterios[0])
    ).toBe("iphone")
  })
})

describe("obterTermosContextoBusca", () => {
  it("usa somente os termos de contexto da intencao", () => {
    const intencao = criarIntencao({
      termoBusca: "assistência",
      termosRelacionados: ["reparo"],
      termosContexto: [
        "geladeira",
        "refrigerador",
      ],
    })

    expect(
      obterTermosContextoBusca(intencao)
    ).toEqual([
      "geladeira",
      "refrigerador",
    ])
  })
})