import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY não foi encontrada no arquivo .env.local"
  )
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const textoDeTeste =
  "Excelente loja, atendimento rápido e produtos de ótima qualidade."

try {
  const resposta = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: textoDeTeste,
  })

  const resultado = resposta.results[0]

  const categoriasSinalizadas = Object.entries(
    resultado.categories
  )
    .filter(([, sinalizada]) => sinalizada === true)
    .map(([categoria]) => categoria)

  console.log(
    JSON.stringify(
      {
        sucesso: true,
        modelo: resposta.model,
        texto: textoDeTeste,
        sinalizado: resultado.flagged,
        categoriasSinalizadas,
      },
      null,
      2
    )
  )
} catch (erro) {
  const detalhes = {
    sucesso: false,
    nome: erro?.name ?? null,
    status: erro?.status ?? null,
    codigo:
      erro?.code ??
      erro?.error?.code ??
      null,
    tipo:
      erro?.type ??
      erro?.error?.type ??
      null,
    mensagem:
      erro?.message ??
      String(erro),
    requestId:
      erro?.request_id ??
      null,
  }

  console.error(
    JSON.stringify(detalhes, null, 2)
  )

  process.exitCode = 1
}