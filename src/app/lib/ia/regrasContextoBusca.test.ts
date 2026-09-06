import { describe, expect, it } from "vitest"

import {
  candidatoAtendeContexto,
  textoContemContexto,
  type LojaParaContexto,
  type ProdutoParaContexto,
} from "./regrasContextoBusca"

function criarLoja(
  sobrescritas: Partial<LojaParaContexto> = {}
): LojaParaContexto {
  return {
    nome: "VG TECH",
    categoria: "Tecnologia",
    descricao:
      "Especializada em reparos eletrônicos",
    ...sobrescritas,
  }
}

function criarProduto(
  sobrescritas: Partial<ProdutoParaContexto> = {}
): ProdutoParaContexto {
  return {
    nome: "iPhone 15 Pro",
    descricao: "Smartphone Apple",
    categoria: "Smartphones",
    marca: "Apple",
    ...sobrescritas,
  }
}

describe("textoContemContexto", () => {
  it("encontra contexto ignorando acentos e maiusculas", () => {
    expect(
      textoContemContexto(
        [
          "Assistência de ELETRÔNICOS",
        ],
        ["eletronicos"]
      )
    ).toBe(true)
  })

  it("retorna falso quando nenhum contexto corresponde", () => {
    expect(
      textoContemContexto(
        [
          "Reparos eletrônicos",
          "Tecnologia",
        ],
        [
          "geladeira",
          "refrigerador",
        ]
      )
    ).toBe(false)
  })
})

describe("candidatoAtendeContexto", () => {
  it("nao bloqueia candidatos quando nao existe contexto obrigatorio", () => {
    const loja = criarLoja()

    expect(
      candidatoAtendeContexto(
        loja,
        [],
        []
      )
    ).toBe(true)
  })

  it("aceita uma loja quando o contexto aparece nos dados da propria loja", () => {
    const loja = criarLoja({
      descricao:
        "Manutenção de notebooks, computadores e eletrônicos",
    })

    expect(
      candidatoAtendeContexto(
        loja,
        [],
        [
          "notebook",
          "computador",
          "eletrônicos",
        ]
      )
    ).toBe(true)
  })

  it("mantem uma assistencia de eletronicos para busca relacionada a notebook", () => {
    const loja = criarLoja({
      descricao:
        "Especializada em reparos eletrônicos",
    })

    expect(
      candidatoAtendeContexto(
        loja,
        [],
        [
          "notebook",
          "computador",
          "eletrônicos",
        ]
      )
    ).toBe(true)
  })

  it("remove uma assistencia de eletronicos de uma busca por geladeira", () => {
    const loja = criarLoja({
      descricao:
        "Especializada em reparos eletrônicos",
    })

    expect(
      candidatoAtendeContexto(
        loja,
        [],
        [
          "geladeira",
          "refrigerador",
          "eletrodomésticos",
          "refrigeração",
        ]
      )
    ).toBe(false)
  })

  it("permite que um produto valide o contexto mesmo quando a loja nao valida diretamente", () => {
    const loja = criarLoja({
      categoria: "Moda",
      descricao:
        "Produtos e acessórios diversos",
    })

    const produto =
      criarProduto({
        nome: "iPhone 15 Pro",
        categoria: "Smartphones",
        marca: "Apple",
      })

    expect(
      candidatoAtendeContexto(
        loja,
        [produto],
        [
          "iphone",
          "smartphone",
          "apple",
        ]
      )
    ).toBe(true)
  })

  it("nao deixa um produto irrelevante validar um contexto diferente", () => {
    const loja = criarLoja({
      categoria: "Tecnologia",
      descricao:
        "Assistência e acessórios",
    })

    const produto =
      criarProduto({
        nome: "Mouse Gamer",
        descricao:
          "Mouse para computador",
        categoria: "Periféricos",
        marca: "Logitech",
      })

    expect(
      candidatoAtendeContexto(
        loja,
        [produto],
        [
          "geladeira",
          "refrigerador",
        ]
      )
    ).toBe(false)
  })
})