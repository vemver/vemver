import { NextResponse } from "next/server"
import { moderarTexto } from "../../lib/moderacao"

export const runtime = "nodejs"

export async function GET() {
  const textoDeTeste =
    "Excelente loja, atendimento rápido e produtos de ótima qualidade."

  try {
    const resultado = await moderarTexto(textoDeTeste)

    return NextResponse.json({
      sucesso: true,
      texto: textoDeTeste,
      resultado,
    })
  } catch (erro) {
    console.error("Erro na rota de teste da moderação:", erro)

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Erro desconhecido ao testar a moderação.",
      },
      {
        status: 500,
      }
    )
  }
}