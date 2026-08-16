import { NextResponse } from "next/server"
import { entenderIntencao } from "../../lib/ia/entenderIntencao"
import { buscarLojas } from "../../lib/ia/buscarLojas"

export const runtime = "nodejs"

const LIMITE_BODY_BYTES = 8_000
const LIMITE_MENSAGEM = 300
const LIMITE_CIDADE = 100

type CorpoRequisicao = {
  mensagem?: unknown
  cidade?: unknown
  uf?: unknown
  latitudeCliente?: unknown
  longitudeCliente?: unknown
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

function coordenadaValida(
  valor: unknown,
  minimo: number,
  maximo: number
): valor is number {
  return (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor >= minimo &&
    valor <= maximo
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
      2. Bloqueamos bodies claramente grandes
      antes mesmo de tentar interpretar o JSON.
    */
    const contentLength =
      request.headers.get("content-length")

    if (contentLength) {
      const tamanhoDeclarado =
        Number(contentLength)

      if (
        Number.isFinite(tamanhoDeclarado) &&
        tamanhoDeclarado >
          LIMITE_BODY_BYTES
      ) {
        return respostaErro(
          "A requisição excede o tamanho permitido.",
          413
        )
      }
    }

    /*
      3. Lemos como texto primeiro para termos
      uma segunda proteção de tamanho.

      Isso também permite tratar JSON inválido
      como erro 400 em vez de cair em erro 500.
    */
    const corpoTexto =
      await request.text()

    const tamanhoReal =
      new TextEncoder().encode(
        corpoTexto
      ).byteLength

    if (
      tamanhoReal >
      LIMITE_BODY_BYTES
    ) {
      return respostaErro(
        "A requisição excede o tamanho permitido.",
        413
      )
    }

    let corpo: CorpoRequisicao

    try {
      corpo = JSON.parse(
        corpoTexto
      ) as CorpoRequisicao
    } catch {
      return respostaErro(
        "O corpo da requisição contém JSON inválido.",
        400
      )
    }

    /*
      4. Validação da mensagem.
    */
    if (
      typeof corpo.mensagem !==
      "string"
    ) {
      return respostaErro(
        "Envie uma mensagem válida.",
        400
      )
    }

    const mensagem =
      corpo.mensagem.trim()

    if (!mensagem) {
      return respostaErro(
        "A mensagem não pode estar vazia.",
        400
      )
    }

    if (
      mensagem.length >
      LIMITE_MENSAGEM
    ) {
      return respostaErro(
        `A mensagem deve ter no máximo ${LIMITE_MENSAGEM} caracteres.`,
        400
      )
    }

    /*
      5. Validação da cidade.
    */
    let cidade: string | null = null

    if (
      corpo.cidade !== undefined &&
      corpo.cidade !== null
    ) {
      if (
        typeof corpo.cidade !==
        "string"
      ) {
        return respostaErro(
          "A cidade informada é inválida.",
          400
        )
      }

      cidade =
        corpo.cidade.trim() || null

      if (
        cidade &&
        cidade.length >
          LIMITE_CIDADE
      ) {
        return respostaErro(
          `A cidade deve ter no máximo ${LIMITE_CIDADE} caracteres.`,
          400
        )
      }
    }

    /*
      6. Validação da UF.

      Quando enviada, deve possuir
      exatamente duas letras.
    */
    let uf: string | null = null

    if (
      corpo.uf !== undefined &&
      corpo.uf !== null
    ) {
      if (
        typeof corpo.uf !==
        "string"
      ) {
        return respostaErro(
          "A UF informada é inválida.",
          400
        )
      }

      const ufNormalizada =
        corpo.uf.trim().toUpperCase()

      if (
        ufNormalizada &&
        !/^[A-Z]{2}$/.test(
          ufNormalizada
        )
      ) {
        return respostaErro(
          "A UF deve conter exatamente duas letras.",
          400
        )
      }

      uf =
        ufNormalizada || null
    }

    /*
      7. Latitude e longitude são opcionais,
      mas quando uma delas existir,
      as duas precisam ser válidas.
    */
    const latitudeFoiEnviada =
      corpo.latitudeCliente !==
        undefined &&
      corpo.latitudeCliente !== null

    const longitudeFoiEnviada =
      corpo.longitudeCliente !==
        undefined &&
      corpo.longitudeCliente !== null

    if (
      latitudeFoiEnviada !==
      longitudeFoiEnviada
    ) {
      return respostaErro(
        "Latitude e longitude devem ser enviadas juntas.",
        400
      )
    }

    let latitudeCliente:
      | number
      | null = null

    let longitudeCliente:
      | number
      | null = null

    if (
      latitudeFoiEnviada &&
      longitudeFoiEnviada
    ) {
      if (
        !coordenadaValida(
          corpo.latitudeCliente,
          -90,
          90
        )
      ) {
        return respostaErro(
          "A latitude informada é inválida.",
          400
        )
      }

      if (
        !coordenadaValida(
          corpo.longitudeCliente,
          -180,
          180
        )
      ) {
        return respostaErro(
          "A longitude informada é inválida.",
          400
        )
      }

      latitudeCliente =
        corpo.latitudeCliente

      longitudeCliente =
        corpo.longitudeCliente
    }

    /*
      8. Somente depois de todas as
      validações chamamos a OpenAI.

      Isso evita gastar uma chamada
      de IA com requisições inválidas.
    */
    const intencao =
      await entenderIntencao(
        mensagem
      )

    const lojas =
      await buscarLojas({
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
    /*
      O erro completo fica somente
      no servidor/Vercel Logs.

      Não devolvemos detalhes internos
      para quem chamou a API.
    */
    console.error(
      "Erro na busca inteligente do VemVer:",
      erro
    )

    return respostaErro(
      "Não foi possível realizar a busca inteligente neste momento.",
      500
    )
  }
}
