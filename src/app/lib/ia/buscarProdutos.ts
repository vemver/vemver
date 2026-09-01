import "server-only"

import { criarClienteSupabaseServidor } from "./clienteSupabaseServidor"

import type { IntencaoBusca } from "./entenderIntencao"
import {
  normalizarTexto,
  obterCriteriosBusca,
} from "./criteriosBusca"

export type ProdutoBusca = {
  id: number
  nome: string | null
  descricao: string | null
  preco: number | null
  preco_promocional: number | null
  imagem_url: string | null
  loja_id: number
  categoria: string | null
  marca: string | null
  promocao: boolean | null
  relevanciaTexto: number
}

type ProdutoRpc = Omit<
  ProdutoBusca,
  "relevanciaTexto"
>

type BuscarProdutosParams = {
  intencao: IntencaoBusca
  cidade?: string | null
  uf?: string | null
}

function calcularRelevanciaProduto(
  produto: {
    nome: string | null
    descricao: string | null
    categoria: string | null
    marca: string | null
  },
  criteriosBusca: string[]
) {
  const nome =
    normalizarTexto(produto.nome)

  const descricao =
    normalizarTexto(produto.descricao)

  const categoria =
    normalizarTexto(produto.categoria)

  const marca =
    normalizarTexto(produto.marca)

  const criterios =
    criteriosBusca
      .map(normalizarTexto)
      .filter(Boolean)

  let relevancia = 0

  for (const criterio of criterios) {
    if (nome === criterio) {
      relevancia += 140
    } else if (
      nome.startsWith(criterio)
    ) {
      relevancia += 115
    } else if (
      nome.includes(criterio)
    ) {
      relevancia += 95
    }

    if (
      categoria === criterio
    ) {
      relevancia += 85
    } else if (
      categoria.includes(criterio)
    ) {
      relevancia += 65
    }

    if (
      marca === criterio
    ) {
      relevancia += 75
    } else if (
      marca.includes(criterio)
    ) {
      relevancia += 55
    }

    if (
      descricao.includes(criterio)
    ) {
      relevancia += 30
    }
  }

  return relevancia
}

export async function buscarProdutos({
  intencao,
  cidade,
  uf,
}: BuscarProdutosParams): Promise<ProdutoBusca[]> {
  const criteriosBusca =
    obterCriteriosBusca(intencao)

  /*
    Se a intenção contém apenas palavras genéricas,
    não existe critério suficiente para relacionar
    produtos à pesquisa.

    Exemplo:
    "loja"

    Nesse caso, produtos não devem ser retornados
    aleatoriamente.
  */
  if (criteriosBusca.length === 0) {
    return []
  }

  const supabase =
    criarClienteSupabaseServidor()

  const { data, error } =
    await supabase.rpc(
      "buscar_produtos_sem_acentos",
      {
        p_criterios:
          criteriosBusca,
        p_cidade:
          cidade?.trim() || null,
        p_uf:
          uf?.trim().toUpperCase() ||
          null,
      }
    )

  if (error) {
    console.error(
      "Erro ao buscar produtos para a IA:",
      error
    )

    throw new Error(
      "Não foi possível buscar produtos neste momento."
    )
  }

  const produtosRpc = (
    Array.isArray(data)
      ? data
      : data
        ? [data]
        : []
  ) as ProdutoRpc[]

  const produtos =
    produtosRpc.map((produto) => ({
      ...produto,
      relevanciaTexto:
        calcularRelevanciaProduto(
          produto,
          criteriosBusca
        ),
    }))

  produtos.sort(
    (
      a: ProdutoBusca,
      b: ProdutoBusca
    ) => {
      if (
        a.relevanciaTexto !==
        b.relevanciaTexto
      ) {
        return (
          b.relevanciaTexto -
          a.relevanciaTexto
        )
      }

      return (
        Number(b.id) -
        Number(a.id)
      )
    }
  )

  return produtos.slice(
    0,
    50
  )
}