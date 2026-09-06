import { describe, expect, it } from "vitest"

import type { IntencaoBusca } from "./entenderIntencao"
import {
  compararResultadosBusca,
  obterMaiorRelevanciaProdutos,
  obterRelevanciaTotal,
} from "./regrasRankingBusca"
import type {
  ResultadoLojaBusca,
} from "./tiposBusca"

function criarIntencao(
  sobrescritas: Partial<IntencaoBusca> = {}
): IntencaoBusca {
  return {
    termoBusca: "notebook",
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

function criarResultado(
  sobrescritas: Partial<ResultadoLojaBusca> = {}
): ResultadoLojaBusca {
  return {
    id: 1,
    nome: "Loja Teste",
    categoria: "Tecnologia",
    cidade: "Joinville",
    uf: "SC",
    descricao: "Loja de tecnologia",
    imagem_url: null,
    whatsapp: null,
    latitude: null,
    longitude: null,
    premium: false,
    patrocinado: false,
    score: 0,

    relevanciaLoja: 0,
    relevanciaProdutos: 0,
    relevanciaTotal: 0,

    distanciaKm: null,

    produtosEncontrados: [],

    ...sobrescritas,
  }
}

describe("obterMaiorRelevanciaProdutos", () => {
  it("retorna zero quando a loja nao possui produtos encontrados", () => {
    expect(
      obterMaiorRelevanciaProdutos([])
    ).toBe(0)
  })

  it("usa somente a maior relevancia entre os produtos", () => {
    expect(
      obterMaiorRelevanciaProdutos([
        { relevanciaTexto: 25 },
        { relevanciaTexto: 95 },
        { relevanciaTexto: 60 },
      ])
    ).toBe(95)
  })

  it("nao soma relevancia pela quantidade de produtos cadastrados", () => {
    const produtos = [
      { relevanciaTexto: 60 },
      { relevanciaTexto: 60 },
      { relevanciaTexto: 60 },
      { relevanciaTexto: 60 },
      { relevanciaTexto: 60 },
    ]

    expect(
      obterMaiorRelevanciaProdutos(
        produtos
      )
    ).toBe(60)
  })
})

describe("obterRelevanciaTotal", () => {
  it("usa a relevancia da loja quando ela for maior", () => {
    expect(
      obterRelevanciaTotal(
        100,
        60
      )
    ).toBe(100)
  })

  it("usa a relevancia do produto quando ela for maior", () => {
    expect(
      obterRelevanciaTotal(
        25,
        140
      )
    ).toBe(140)
  })
})

describe("compararResultadosBusca", () => {
  it("prioriza relevancia mesmo que o outro resultado esteja mais perto e tenha score maior", () => {
    const maisRelevante =
      criarResultado({
        id: 1,
        nome: "Mais relevante",
        relevanciaTotal: 100,
        distanciaKm: 10,
        score: 1,
      })

    const menosRelevante =
      criarResultado({
        id: 2,
        nome: "Menos relevante",
        relevanciaTotal: 90,
        distanciaKm: 1,
        score: 999,
      })

    const resultados = [
      menosRelevante,
      maisRelevante,
    ]

    resultados.sort((a, b) =>
      compararResultadosBusca(
        a,
        b,
        criarIntencao({
          pertoDeMim: true,
        })
      )
    )

    expect(
      resultados[0].id
    ).toBe(1)
  })

  it("usa distancia como desempate quando pertoDeMim for verdadeiro", () => {
    const perto =
      criarResultado({
        id: 1,
        nome: "Loja perto",
        relevanciaTotal: 100,
        distanciaKm: 1,
        score: 10,
      })

    const longe =
      criarResultado({
        id: 2,
        nome: "Loja longe",
        relevanciaTotal: 100,
        distanciaKm: 8,
        score: 999,
      })

    const resultados = [
      longe,
      perto,
    ]

    resultados.sort((a, b) =>
      compararResultadosBusca(
        a,
        b,
        criarIntencao({
          pertoDeMim: true,
        })
      )
    )

    expect(
      resultados[0].id
    ).toBe(1)
  })

  it("ignora distancia quando pertoDeMim nao foi solicitado", () => {
    const pertoComScoreMenor =
      criarResultado({
        id: 1,
        nome: "Loja perto",
        relevanciaTotal: 100,
        distanciaKm: 1,
        score: 10,
      })

    const longeComScoreMaior =
      criarResultado({
        id: 2,
        nome: "Loja longe",
        relevanciaTotal: 100,
        distanciaKm: 20,
        score: 80,
      })

    const resultados = [
      pertoComScoreMenor,
      longeComScoreMaior,
    ]

    resultados.sort((a, b) =>
      compararResultadosBusca(
        a,
        b,
        criarIntencao({
          pertoDeMim: false,
        })
      )
    )

    expect(
      resultados[0].id
    ).toBe(2)
  })

  it("prioriza resultado com distancia conhecida quando pertoDeMim for verdadeiro", () => {
    const distanciaConhecida =
      criarResultado({
        id: 1,
        relevanciaTotal: 100,
        distanciaKm: 4,
        score: 0,
      })

    const distanciaDesconhecida =
      criarResultado({
        id: 2,
        relevanciaTotal: 100,
        distanciaKm: null,
        score: 999,
      })

    const resultados = [
      distanciaDesconhecida,
      distanciaConhecida,
    ]

    resultados.sort((a, b) =>
      compararResultadosBusca(
        a,
        b,
        criarIntencao({
          pertoDeMim: true,
        })
      )
    )

    expect(
      resultados[0].id
    ).toBe(1)
  })

  it("usa score depois da relevancia quando distancia nao participa do ranking", () => {
    const scoreMenor =
      criarResultado({
        id: 1,
        nome: "Loja A",
        relevanciaTotal: 100,
        score: 20,
      })

    const scoreMaior =
      criarResultado({
        id: 2,
        nome: "Loja B",
        relevanciaTotal: 100,
        score: 80,
      })

    const resultados = [
      scoreMenor,
      scoreMaior,
    ]

    resultados.sort((a, b) =>
      compararResultadosBusca(
        a,
        b,
        criarIntencao()
      )
    )

    expect(
      resultados[0].id
    ).toBe(2)
  })

  it("usa nome como desempate final", () => {
    const lojaZ =
      criarResultado({
        id: 1,
        nome: "Zulu Tecnologia",
        relevanciaTotal: 100,
        score: 50,
      })

    const lojaA =
      criarResultado({
        id: 2,
        nome: "Alpha Tecnologia",
        relevanciaTotal: 100,
        score: 50,
      })

    const resultados = [
      lojaZ,
      lojaA,
    ]

    resultados.sort((a, b) =>
      compararResultadosBusca(
        a,
        b,
        criarIntencao()
      )
    )

    expect(
      resultados[0].nome
    ).toBe("Alpha Tecnologia")
  })
})