import "server-only"

import { createClient } from "@supabase/supabase-js"
import type { IntencaoBusca } from "./entenderIntencao"
import { calcularDistanciaKm } from "./calcularDistancia"

type LojaBusca = {
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
  distanciaKm: number | null
}

type BuscarLojasParams = {
  intencao: IntencaoBusca
  cidade?: string | null
  uf?: string | null
  latitudeCliente?: number | null
  longitudeCliente?: number | null
}

function criarClienteSupabaseServidor() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não foi encontrada nas variáveis de ambiente."
    )
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não foi encontrada nas variáveis de ambiente."
    )
  }

  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
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

  let consulta = supabase
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
    .eq("ativo", true)
    .eq("status", "aprovada")

  if (cidade?.trim()) {
    consulta = consulta.ilike(
      "cidade",
      cidade.trim()
    )
  }

  if (uf?.trim()) {
    consulta = consulta.eq(
      "uf",
      uf.trim().toUpperCase()
    )
  }

  const termoBusca =
    intencao.termoBusca.trim()

  const categoria =
    intencao.categoria?.trim()

  const filtrosTexto: string[] = []

  if (termoBusca) {
    filtrosTexto.push(
      `nome.ilike.%${termoBusca}%`,
      `categoria.ilike.%${termoBusca}%`,
      `descricao.ilike.%${termoBusca}%`
    )
  }

  if (
    categoria &&
    categoria.toLowerCase() !==
      termoBusca.toLowerCase()
  ) {
    filtrosTexto.push(
      `nome.ilike.%${categoria}%`,
      `categoria.ilike.%${categoria}%`,
      `descricao.ilike.%${categoria}%`
    )
  }

  if (filtrosTexto.length > 0) {
    consulta = consulta.or(
      filtrosTexto.join(",")
    )
  }

  consulta = consulta
    .order("patrocinado", {
      ascending: false,
      nullsFirst: false,
    })
    .order("premium", {
      ascending: false,
      nullsFirst: false,
    })
    .order("score", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(20)

  const { data, error } = await consulta

  if (error) {
    console.error(
      "Erro ao buscar lojas para a IA:",
      error
    )

    throw new Error(
      "Não foi possível buscar lojas neste momento."
    )
  }

  const lojasComDistancia = (
    data ?? []
  ).map((loja) => {
    const possuiCoordenadasLoja =
      typeof loja.latitude === "number" &&
      typeof loja.longitude === "number"

    const possuiCoordenadasCliente =
      typeof latitudeCliente === "number" &&
      typeof longitudeCliente === "number"

    const distanciaKm =
      possuiCoordenadasLoja &&
      possuiCoordenadasCliente
        ? calcularDistanciaKm(
            latitudeCliente,
            longitudeCliente,
            loja.latitude,
            loja.longitude
          )
        : null

    return {
      ...loja,
      distanciaKm:
        distanciaKm === null
          ? null
          : Number(
              distanciaKm.toFixed(2)
            ),
    }
  })

  lojasComDistancia.sort((a, b) => {
    if (
      a.distanciaKm !== null &&
      b.distanciaKm !== null
    ) {
      return (
        a.distanciaKm -
        b.distanciaKm
      )
    }

    if (a.distanciaKm !== null) {
      return -1
    }

    if (b.distanciaKm !== null) {
      return 1
    }

    const patrocinadoA =
      a.patrocinado ? 1 : 0

    const patrocinadoB =
      b.patrocinado ? 1 : 0

    if (
      patrocinadoA !==
      patrocinadoB
    ) {
      return (
        patrocinadoB -
        patrocinadoA
      )
    }

    const premiumA =
      a.premium ? 1 : 0

    const premiumB =
      b.premium ? 1 : 0

    if (
      premiumA !==
      premiumB
    ) {
      return premiumB - premiumA
    }

    return (
      (b.score ?? 0) -
      (a.score ?? 0)
    )
  })

  return lojasComDistancia
}