import { normalizarTexto } from "./criteriosBusca"

export type LojaParaContexto = {
  nome: string | null
  categoria: string | null
  descricao: string | null
}

export type ProdutoParaContexto = {
  nome: string | null
  descricao: string | null
  categoria: string | null
  marca: string | null
}

export function textoContemContexto(
  valores: Array<string | null | undefined>,
  termosContexto: string[]
) {
  const textosNormalizados = valores
    .map(normalizarTexto)
    .filter(Boolean)

  const contextosNormalizados = termosContexto
    .map(normalizarTexto)
    .filter(Boolean)

  return contextosNormalizados.some(
    (contexto) =>
      textosNormalizados.some((texto) =>
        texto.includes(contexto)
      )
  )
}

export function candidatoAtendeContexto(
  loja: LojaParaContexto,
  produtos: ProdutoParaContexto[],
  termosContexto: string[]
) {
  // Sem contexto obrigatorio, nenhum candidato
  // deve ser bloqueado.
  if (termosContexto.length === 0) {
    return true
  }

  const contextoNaLoja = textoContemContexto(
    [
      loja.nome,
      loja.categoria,
      loja.descricao,
    ],
    termosContexto
  )

  if (contextoNaLoja) {
    return true
  }

  // Um produto tambem pode validar o contexto
  // mesmo quando a descricao da loja nao valida.
  return produtos.some((produto) =>
    textoContemContexto(
      [
        produto.nome,
        produto.descricao,
        produto.categoria,
        produto.marca,
      ],
      termosContexto
    )
  )
}