import type { IntencaoBusca } from "./entenderIntencao"

const PALAVRAS_GENERICAS_BUSCA = new Set([
  "loja",
  "lojas",
  "estabelecimento",
  "estabelecimentos",
  "comercio",
  "local",
  "locais",
  "lugar",
  "lugares",
  "de",
  "da",
  "das",
  "do",
  "dos",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "um",
  "uma",
  "uns",
  "umas",
])

export function normalizarTexto(
  valor: string | null | undefined
) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function limparPalavraBusca(
  palavra: string
) {
  return palavra
    .replace(/[.,;:!?()[\]{}"'%_]/g, "")
    .trim()
}

function obterPalavrasSignificativas(
  valor: string | null | undefined
) {
  if (!valor?.trim()) {
    return []
  }

  return valor
    .trim()
    .split(/\s+/)
    .map(limparPalavraBusca)
    .filter(Boolean)
    .filter((palavra) => {
      const palavraNormalizada =
        normalizarTexto(palavra)

      return (
        palavraNormalizada.length >= 2 &&
        !PALAVRAS_GENERICAS_BUSCA.has(
          palavraNormalizada
        )
      )
    })
}

function adicionarCriterio(
  criterios: Map<string, string>,
  criterio: string
) {
  const criterioLimpo =
    criterio.trim()

  if (!criterioLimpo) {
    return
  }

  const criterioNormalizado =
    normalizarTexto(criterioLimpo)

  if (!criterioNormalizado) {
    return
  }

  criterios.set(
    criterioNormalizado,
    criterioLimpo
  )
}

function transformarEmCriterios(
  candidatos: Array<
    string | null | undefined
  >
) {
  const criterios =
    new Map<string, string>()

  for (const candidato of candidatos) {
    const palavras =
      obterPalavrasSignificativas(
        candidato
      )

    if (palavras.length === 0) {
      continue
    }

    /*
      Mantemos também a expressão completa.

      Exemplo:
      "iphone pro"
    */
    adicionarCriterio(
      criterios,
      palavras.join(" ")
    )

    /*
      E adicionamos cada palavra
      significativa separadamente.

      Exemplo:
      "iphone pro"
      -> "iphone"
      -> "pro"
    */
    for (const palavra of palavras) {
      adicionarCriterio(
        criterios,
        palavra
      )
    }
  }

  return Array.from(
    criterios.values()
  )
}

export function obterCriteriosBusca(
  intencao: IntencaoBusca
) {
  /*
    Primeiro verificamos exclusivamente
    o termo principal informado pelo
    usuário.

    Se depois da remoção de palavras
    genéricas não restar nenhum conceito
    significativo, tratamos a pesquisa
    como uma descoberta genérica.

    Exemplo:

    "loja"

    -> nenhum critério textual obrigatório
    -> listar lojas da região/ranking
    -> não usar expansão semântica
  */
  const criteriosTermoPrincipal =
    transformarEmCriterios([
      intencao.termoBusca,
    ])

  if (
    criteriosTermoPrincipal.length === 0
  ) {
    return []
  }

  /*
    Quando existe um conceito principal
    significativo, podemos ampliar a
    recuperação com categoria, termos
    relacionados e contexto.

    Exemplos:

    "loja de iphone"
    -> iphone

    "assistência notebook"
    -> assistência
    -> notebook
    -> reparo
    -> informática
    -> eletrônicos
  */
  return transformarEmCriterios([
    intencao.termoBusca,
    intencao.categoria,
    ...intencao.termosRelacionados,
    ...intencao.termosContexto,
  ])
}

export function obterTermosContextoBusca(
  intencao: IntencaoBusca
) {
  /*
    Os termos de contexto têm uma função
    diferente dos critérios gerais.

    Eles representam o domínio essencial
    da necessidade e são utilizados pelo
    agregador para impedir falsos positivos.
  */
  return transformarEmCriterios(
    intencao.termosContexto
  )
}