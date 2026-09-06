import type { IntencaoBusca } from "./entenderIntencao"
import type {
  ResultadoLojaBusca,
} from "./tiposBusca"

type ItemComRelevancia = {
  relevanciaTexto: number
}

export function obterMaiorRelevanciaProdutos(
  produtos: ItemComRelevancia[]
) {
  if (produtos.length === 0) {
    return 0
  }

  return Math.max(
    ...produtos.map(
      (produto) =>
        produto.relevanciaTexto
    )
  )
}

export function obterRelevanciaTotal(
  relevanciaLoja: number,
  relevanciaProdutos: number
) {
  return Math.max(
    relevanciaLoja,
    relevanciaProdutos
  )
}

export function compararResultadosBusca(
  a: ResultadoLojaBusca,
  b: ResultadoLojaBusca,
  intencao: IntencaoBusca
) {
  /*
    1. RELEVÂNCIA

    O resultado mais relevante sempre
    deve aparecer primeiro.
  */
  if (
    a.relevanciaTotal !==
    b.relevanciaTotal
  ) {
    return (
      b.relevanciaTotal -
      a.relevanciaTotal
    )
  }

  /*
    2. DISTÂNCIA

    A distância só participa do ranking
    quando o usuário pediu explicitamente
    algo perto dele.
  */
  if (
    intencao.pertoDeMim === true
  ) {
    if (
      a.distanciaKm !== null &&
      b.distanciaKm !== null
    ) {
      if (
        a.distanciaKm !==
        b.distanciaKm
      ) {
        return (
          a.distanciaKm -
          b.distanciaKm
        )
      }
    } else if (
      a.distanciaKm !== null
    ) {
      return -1
    } else if (
      b.distanciaKm !== null
    ) {
      return 1
    }
  }

  /*
    3. SCORE

    Score e fatores comerciais só entram
    depois da relevância e, quando
    solicitado, da distância.
  */
  if (
    (a.score ?? 0) !==
    (b.score ?? 0)
  ) {
    return (
      (b.score ?? 0) -
      (a.score ?? 0)
    )
  }

  /*
    4. DESEMPATE ESTÁVEL
  */
  return (a.nome ?? "").localeCompare(
    b.nome ?? "",
    "pt-BR"
  )
}