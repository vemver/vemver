import "server-only"
import OpenAI from "openai"

type ResultadoModeracao = {
  permitido: boolean
  sinalizado: boolean
  categoriasSinalizadas: string[]
  mensagem: string
}

function criarClienteOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY não foi encontrada nas variáveis de ambiente."
    )
  }

  return new OpenAI({
    apiKey,
  })
}

export async function moderarTexto(
  texto: string
): Promise<ResultadoModeracao> {
  const textoLimpo = texto.trim()

  if (!textoLimpo) {
    return {
      permitido: false,
      sinalizado: false,
      categoriasSinalizadas: [],
      mensagem: "O texto não pode estar vazio.",
    }
  }

  try {
    const openai = criarClienteOpenAI()

    const resposta = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: textoLimpo,
    })

    const resultado = resposta.results[0]

    if (!resultado) {
      throw new Error(
        "A OpenAI não retornou um resultado de moderação."
      )
    }

    const categoriasSinalizadas = Object.entries(
      resultado.categories
    )
      .filter(([, sinalizada]) => sinalizada === true)
      .map(([categoria]) => categoria)

    if (resultado.flagged) {
      return {
        permitido: false,
        sinalizado: true,
        categoriasSinalizadas,
        mensagem:
          "O texto contém conteúdo que não é permitido no VemVer.",
      }
    }

    return {
      permitido: true,
      sinalizado: false,
      categoriasSinalizadas: [],
      mensagem: "Texto aprovado pela moderação.",
    }
  } catch (erro) {
    console.error("Erro ao moderar texto:", erro)

    throw new Error(
      "Não foi possível verificar o conteúdo neste momento."
    )
  }
}