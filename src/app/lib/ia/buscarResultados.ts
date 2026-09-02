import "server-only"

import type { IntencaoBusca } from "./entenderIntencao"
import {
  buscarLojas,
  type LojaBusca,
} from "./buscarLojas"
import {
  buscarProdutos,
  type ProdutoBusca,
} from "./buscarProdutos"
import { criarClienteSupabaseServidor } from "./clienteSupabaseServidor"
import { calcularDistanciaKm } from "./calcularDistancia"
import {
  obterTermosContextoBusca,
} from "./criteriosBusca"
import {
  candidatoAtendeContexto,
} from "./regrasContextoBusca"
import {
  compararResultadosBusca,
  obterMaiorRelevanciaProdutos,
  obterRelevanciaTotal,
} from "./regrasRankingBusca"
import type {
  ProdutoEncontradoBusca,
  ResultadoLojaBusca,
} from "./tiposBusca"

type BuscarResultadosParams = {
  intencao: IntencaoBusca
  cidade?: string | null
  uf?: string | null
  latitudeCliente?: number | null
  longitudeCliente?: number | null
}

type LojaBasica = {
  id: number
  nome: string | null
  categoria: string | null
  cidade: string | null
  uf: string | null
  descricao: string | null
  imagem_url: string | null
  whatsapp: string | null
  latitude: number | null
  longitude: number | null
  premium: boolean | null
  patrocinado: boolean | null
  score: number | null
}

function converterProduto(
  produto: ProdutoBusca
): ProdutoEncontradoBusca {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    categoria: produto.categoria,
    marca: produto.marca,
    preco: produto.preco,
    preco_promocional:
      produto.preco_promocional,
    imagem_url: produto.imagem_url,
    promocao: produto.promocao,
    relevanciaTexto:
      produto.relevanciaTexto,
  }
}

function calcularDistanciaLoja(
  loja: {
    latitude: number | null
    longitude: number | null
  },
  latitudeCliente?: number | null,
  longitudeCliente?: number | null
) {
  if (
    typeof loja.latitude !== "number" ||
    typeof loja.longitude !== "number" ||
    typeof latitudeCliente !== "number" ||
    typeof longitudeCliente !== "number"
  ) {
    return null
  }

  const distancia =
    calcularDistanciaKm(
      latitudeCliente,
      longitudeCliente,
      loja.latitude,
      loja.longitude
    )

  return Number(
    distancia.toFixed(2)
  )
}

export async function buscarResultados({
  intencao,
  cidade,
  uf,
  latitudeCliente,
  longitudeCliente,
}: BuscarResultadosParams): Promise<
  ResultadoLojaBusca[]
> {
  /*
    Estes termos representam o domínio
    essencial da intenção e serão usados
    depois da recuperação dos candidatos
    para eliminar falsos positivos.
  */
  const termosContexto =
    obterTermosContextoBusca(
      intencao
    )

  /*
    As buscas de lojas e produtos são
    independentes e podem ser executadas
    em paralelo.
  */
  const [
    lojasEncontradas,
    produtosEncontrados,
  ] = await Promise.all([
    buscarLojas({
      intencao,
      cidade,
      uf,
      latitudeCliente,
      longitudeCliente,
    }),

    buscarProdutos({
      intencao,
      cidade,
      uf,
    }),
  ])

  /*
    Agrupamos os produtos pela loja
    à qual pertencem.
  */
  const produtosPorLoja =
    new Map<number, ProdutoBusca[]>()

  for (
    const produto of produtosEncontrados
  ) {
    const lojaId =
      Number(produto.loja_id)

    const produtosAtuais =
      produtosPorLoja.get(lojaId) ?? []

    produtosAtuais.push(produto)

    produtosPorLoja.set(
      lojaId,
      produtosAtuais
    )
  }

  /*
    As lojas encontradas diretamente
    já possuem os dados necessários.

    Criamos um mapa porque também
    precisaremos incluir lojas que foram
    descobertas somente através de seus
    produtos.
  */
  const lojasPorId =
    new Map<number, LojaBusca>()

  for (
    const loja of lojasEncontradas
  ) {
    lojasPorId.set(
      Number(loja.id),
      loja
    )
  }

  /*
    Identificamos lojas encontradas
    através de produtos que ainda não
    estão no conjunto de lojas.
  */
  const idsLojasFaltantes =
    Array.from(
      produtosPorLoja.keys()
    ).filter(
      (lojaId) =>
        !lojasPorId.has(lojaId)
    )

  if (
    idsLojasFaltantes.length > 0
  ) {
    const supabase =
      criarClienteSupabaseServidor()

    const {
      data: lojasFaltantes,
      error,
    } = await supabase
      .from("lojas")
      .select(
        `
          id,
          nome,
          categoria,
          cidade,
          uf,
          descricao,
          imagem_url,
          whatsapp,
          latitude,
          longitude,
          premium,
          patrocinado,
          score
        `
      )
      .in(
        "id",
        idsLojasFaltantes
      )
      .eq("ativo", true)
      .eq("status", "aprovada")

    if (error) {
      console.error(
        "Erro ao carregar lojas encontradas através de produtos:",
        error
      )

      throw new Error(
        "Não foi possível completar os resultados da busca."
      )
    }

    const lojasBasicas = (
      Array.isArray(lojasFaltantes)
        ? lojasFaltantes
        : []
    ) as LojaBasica[]

    for (
      const loja of lojasBasicas
    ) {
      lojasPorId.set(
        Number(loja.id),
        {
          ...loja,
          relevanciaTexto: 0,
          distanciaKm:
            calcularDistanciaLoja(
              loja,
              latitudeCliente,
              longitudeCliente
            ),
        }
      )
    }
  }

  /*
    Transformamos lojas e produtos em
    um único contrato de resultado.
  */
  const resultados:
    ResultadoLojaBusca[] = []

  for (
    const loja of lojasPorId.values()
  ) {
    const produtosDaLoja =
      produtosPorLoja.get(
        Number(loja.id)
      ) ?? []

    /*
      A recuperação inicial é
      propositalmente mais ampla.

      Neste ponto aplicamos a barreira
      de contexto.

      Um candidato que entrou apenas
      porque possui uma palavra genérica
      relacionada à ação, como "reparo",
      não será mantido se não possuir
      também relação com o domínio
      essencial procurado.
    */
    if (
      !candidatoAtendeContexto(
        loja,
        produtosDaLoja,
        termosContexto
      )
    ) {
      continue
    }

    /*
      Ordenamos os produtos encontrados
      pela relevância textual apenas para
      definir quais serão apresentados
      ao usuário.
    */
    const produtosOrdenados =
      [...produtosDaLoja].sort(
        (a, b) =>
          b.relevanciaTexto -
          a.relevanciaTexto
      )

    /*
      A relevância de produtos considera
      somente o produto mais relevante.

      Não somamos relevância entre vários
      produtos para impedir que uma loja
      suba artificialmente no ranking por
      quantidade de cadastros.
    */
    const relevanciaProdutos =
      obterMaiorRelevanciaProdutos(
        produtosOrdenados
      )

    const relevanciaLoja =
      loja.relevanciaTexto

    /*
      A relevância final da loja é a
      melhor correspondência entre:

      - dados da própria loja;
      - produtos encontrados.
    */
    const relevanciaTotal =
      obterRelevanciaTotal(
        relevanciaLoja,
        relevanciaProdutos
      )

    resultados.push({
      id: loja.id,
      nome: loja.nome,
      categoria: loja.categoria,
      cidade: loja.cidade,
      uf: loja.uf,
      descricao: loja.descricao,
      imagem_url: loja.imagem_url,
      whatsapp: loja.whatsapp,
      latitude: loja.latitude,
      longitude: loja.longitude,
      premium: loja.premium,
      patrocinado: loja.patrocinado,
      score: loja.score,

      relevanciaLoja,
      relevanciaProdutos,
      relevanciaTotal,

      distanciaKm:
        loja.distanciaKm,

      produtosEncontrados:
        produtosOrdenados
          .slice(0, 3)
          .map(converterProduto),
    })
  }

  /*
    Ordenação final:

    1. relevância;
    2. distância quando solicitada;
    3. score;
    4. nome como desempate.
  */
  resultados.sort(
    (a, b) =>
      compararResultadosBusca(
        a,
        b,
        intencao
      )
  )

  return resultados.slice(
    0,
    20
  )
}