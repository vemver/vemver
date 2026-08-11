import { NextResponse } from "next/server"
import { entenderIntencao } from "../../lib/ia/entenderIntencao"
import { buscarLojas } from "../../lib/ia/buscarLojas"

export const runtime = "nodejs"

type CorpoRequisicao = {
  mensagem?: unknown
  cidade?: unknown
  uf?: unknown
  latitudeCliente?: unknown
  longitudeCliente?: unknown
}

export async function POST(request: Request) {
  try {
    const corpo = (await request.json()) as CorpoRequisicao

    if (typeof corpo.mensagem !== "string") {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Envie uma mensagem válida.",
        },
        {
          status: 400,
        }
      )
    }

    const mensagem = corpo.mensagem.trim()

    if (!mensagem) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "A mensagem não pode estar vazia.",
        },
        {
          status: 400,
        }
      )
    }

    const cidade =
      typeof corpo.cidade === "string"
        ? corpo.cidade.trim()
        : null

    const uf =
      typeof corpo.uf === "string"
        ? corpo.uf.trim()
        : null

    const latitudeCliente =
      typeof corpo.latitudeCliente === "number"
        ? corpo.latitudeCliente
        : null

    const longitudeCliente =
      typeof corpo.longitudeCliente === "number"
        ? corpo.longitudeCliente
        : null

    const intencao = await entenderIntencao(mensagem)

    const lojas = await buscarLojas({
      intencao,
      cidade,
      uf,
      latitudeCliente,
      longitudeCliente,
    })

    return NextResponse.json({
      sucesso: true,
      mensagem,
      localizacao: {
        cidade,
        uf,
        latitudeCliente,
        longitudeCliente,
      },
      intencao,
      totalLojas: lojas.length,
      lojas,
    })
  } catch (erro) {
    console.error(
      "Erro na busca inteligente do VemVer:",
      erro
    )

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não foi possível realizar a busca inteligente.",
      },
      {
        status: 500,
      }
    )
  }
}