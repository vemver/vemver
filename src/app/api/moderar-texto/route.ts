import { NextResponse } from "next/server"
import { moderarTexto } from "../../lib/moderacao"

export const runtime = "nodejs"

type CorpoRequisicao = {
  texto?: unknown
}

export async function POST(request: Request) {
  try {
    const corpo = (await request.json()) as CorpoRequisicao

    if (typeof corpo.texto !== "string") {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Envie um texto válido para moderação.",
        },
        {
          status: 400,
        },
      )
    }

    const texto = corpo.texto.trim()

    if (!texto) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "O texto não pode estar vazio.",
        },
        {
          status: 400,
        },
      )
    }

    const resultado = await moderarTexto(texto)

    return NextResponse.json({
      sucesso: true,
      resultado,
    })
  } catch (erro) {
    console.error("Erro na rota de moderação:", erro)

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Não foi possível verificar o conteúdo.",
      },
      {
        status: 500,
      },
    )
  }
}