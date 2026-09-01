import "server-only"

import { criarClienteSupabaseServidor } from "./clienteSupabaseServidor"

import type { IntencaoBusca } from "./entenderIntencao"
import { calcularDistanciaKm } from "./calcularDistancia"
import {
  normalizarTexto,
  obterCriteriosBusca,
} from "./criteriosBusca"

export type LojaBusca = {
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
  relevanciaTexto: number
  distanciaKm: number | null
}

type LojaRpc = Omit<
  LojaBusca,
  "relevanciaTexto" | "distanciaKm"
>

type BuscarLojasParams = {
  intencao: IntencaoBusca
  cidade?: string | null
  uf?: string | null
  latitudeCliente?: number | null
  longitudeCliente?: number | null
}



function calcularRelevanciaTexto(
  loja: {
    nome: string | null
    categoria: string | null
    descricao: string | null
  },
  criteriosBusca: string[]
) {
  const nomeLoja =
    normalizarTexto(loja.nome)

  const categoriaLoja =
    normalizarTexto(loja.categoria)

  const descricaoLoja =
    normalizarTexto(loja.descricao)

  const criterios =
    criteriosBusca
      .map(normalizarTexto)
      .filter(Boolean)

  let relevancia = 0

  for (const criterio of criterios) {
    if (nomeLoja === criterio) {
      relevancia += 100
    } else if (
      nomeLoja.startsWith(criterio)
    ) {
      relevancia += 80
    } else if (
      nomeLoja.includes(criterio)
    ) {
      relevancia += 60
    }

    if (
      categoriaLoja === criterio
    ) {
      relevancia += 90
    } else if (
      categoriaLoja.includes(criterio)
    ) {
      relevancia += 70
    }

    if (
      descricaoLoja.includes(criterio)
    ) {
      relevancia += 25
    }
  }

  return relevancia
}

export async function buscarLojas({
  intencao,
  cidade,
  uf,
  latitudeCliente,
  longitudeCliente,
}: BuscarLojasParams): Promise<LojaBusca[]> {
  const supabase =
    criarClienteSupabaseServidor()

  const criteriosBusca =
    obterCriteriosBusca(intencao)

  const { data, error } =
    await supabase
      .rpc(
        "buscar_lojas_sem_acentos",
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

  if (error) {
    console.error(
      "Erro ao buscar lojas para a IA:",
      error
    )

    throw new Error(
      "Não foi possível buscar lojas neste momento."
    )
  }

  /*
    A tipagem automática do Supabase pode interpretar
    o retorno da RPC como objeto ou lista.

    Aqui garantimos para o TypeScript que trabalharemos
    sempre com uma lista de lojas.
  */
  const lojasRpc = (
    Array.isArray(data)
      ? data
      : data
        ? [data]
        : []
  ) as LojaRpc[]

  const lojasComDistancia: LojaBusca[] =
    lojasRpc.map((loja) => {
      const latitudeLoja =
        loja.latitude

      const longitudeLoja =
        loja.longitude

      const latitudeUsuario =
        latitudeCliente

      const longitudeUsuario =
        longitudeCliente

      const distanciaKm =
        typeof latitudeLoja === "number" &&
        typeof longitudeLoja === "number" &&
        typeof latitudeUsuario === "number" &&
        typeof longitudeUsuario === "number"
          ? calcularDistanciaKm(
              latitudeUsuario,
              longitudeUsuario,
              latitudeLoja,
              longitudeLoja
            )
          : null

      const relevanciaTexto =
        calcularRelevanciaTexto(
          loja,
          criteriosBusca
        )

      return {
        ...loja,
        relevanciaTexto,
        distanciaKm:
          distanciaKm === null
            ? null
            : Number(
                distanciaKm.toFixed(2)
              ),
      }
    })

  lojasComDistancia.sort(
    (
      a: LojaBusca,
      b: LojaBusca
    ) => {
      /*
        1. RELEVÂNCIA

        Primeiro verificamos qual loja
        corresponde melhor ao que o
        cliente está procurando.
      */
      if (
        a.relevanciaTexto !==
        b.relevanciaTexto
      ) {
        return (
          b.relevanciaTexto -
          a.relevanciaTexto
        )
      }

      /*
        2. DISTÂNCIA

        Só participa da ordenação quando
        o cliente pediu algo perto dele.
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

        Premium e patrocinado já fazem
        parte do score do banco.

        Não somamos esses benefícios
        novamente aqui.
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
        4. DESEMPATE

        Ordem alfabética.
      */
      return (a.nome ?? "").localeCompare(
        b.nome ?? "",
        "pt-BR"
      )
    }
  )

  return lojasComDistancia.slice(
    0,
    20
  )
}