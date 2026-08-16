import { NextResponse } from "next/server"
import { moderarTexto } from "../../lib/moderacao"

export const runtime = "nodejs"

const LIMITE_BODY_BYTES = 8_000
const LIMITE_TEXTO = 2_000

type CorpoRequisicao = {
  texto?: unknown
}

function respostaErro(
  mensagem: string,
  status: number
) {
  return NextResponse.json(
    {
      sucesso: false,
      mensagem,
    },
    {
      status,
    }
  )
}

function ehObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  )
}

export async function POST(request: Request) {
  try {
    /*
      1. Aceitamos somente JSON.
    */
    const contentType =
      request.headers.get("content-type") ?? ""

    if (
      !contentType
        .toLowerCase()
        .includes("application/json")
    ) {
      return respostaErro(
        "O conteúdo da requisição deve ser JSON.",
        415
      )
    }

    /*
      2. Bloqueamos bodies grandes
      antes de tentar interpretar o JSON.
    */
    const contentLength =
      request.headers.get("content-length")

    if (contentLength) {
      const tamanhoDeclarado =
        Number(contentLength)

      if (
        Number.isFinite(tamanhoDeclarado) &&
        tamanhoDeclarado > LIMITE_BODY_BYTES
      ) {
        return respostaErro(
          "A requisição excede o tamanho permitido.",
          413
        )
      }
    }

    /*
      3. Lemos o body como texto para
      validar o tamanho real recebido.
    */
    const corpoTexto =
      await request.text()

    const tamanhoReal =
      new TextEncoder().encode(
        corpoTexto
      ).byteLength

    if (
      tamanhoReal > LIMITE_BODY_BYTES
    ) {
      return respostaErro(
        "A requisição excede o tamanho permitido.",
        413
      )
    }

    /*
      4. Tratamos JSON inválido
      como erro 400.
    */
    let corpoDesconhecido: unknown

    try {
      corpoDesconhecido =
        JSON.parse(corpoTexto)
    } catch {
      return respostaErro(
        "O corpo da requisição contém JSON inválido.",
        400
      )
    }

    /*
      5. O body precisa ser um objeto JSON.
    */
    if (!ehObjeto(corpoDesconhecido)) {
      return respostaErro(
        "O corpo da requisição é inválido.",
        400
      )
    }

    const corpo =
      corpoDesconhecido as CorpoRequisicao

    /*
      6. Validação do texto.
    */
    if (
      typeof corpo.texto !== "string"
    ) {
      return respostaErro(
        "Envie um texto válido para moderação.",
        400
      )
    }

    const texto =
      corpo.texto.trim()

    if (!texto) {
      return respostaErro(
        "O texto não pode estar vazio.",
        400
      )
    }

    if (
      texto.length > LIMITE_TEXTO
    ) {
      return respostaErro(
        `O texto deve ter no máximo ${LIMITE_TEXTO} caracteres.`,
        400
      )
    }

    /*
      7. A OpenAI só é chamada depois
      que todas as validações passaram.
    */
    const resultado =
      await moderarTexto(texto)

    return NextResponse.json({
      sucesso: true,
      resultado,
    })
  } catch (erro) {
    /*
      O erro completo fica somente
      nos logs do servidor.

      Não expomos detalhes internos
      para quem chamou a API.
    */
    console.error(
      "Erro na rota de moderação:",
      erro
    )

    return respostaErro(
      "Não foi possível verificar o conteúdo neste momento.",
      500
    )
  }
}
