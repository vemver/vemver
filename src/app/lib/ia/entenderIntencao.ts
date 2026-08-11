import "server-only"
import OpenAI from "openai"

export type IntencaoBusca = {
  termoBusca: string
  categoria: string | null
  delivery: boolean | null
  abertoAgora: boolean | null
  pertoDeMim: boolean | null
  preco: "baixo" | "medio" | "alto" | null
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

export async function entenderIntencao(
  mensagem: string
): Promise<IntencaoBusca> {
  const mensagemLimpa = mensagem.trim()

  if (!mensagemLimpa) {
    throw new Error("A mensagem do usuário não pode estar vazia.")
  }

  const openai = criarClienteOpenAI()

  const resposta = await openai.responses.create({
    model: "gpt-4.1-mini",

    input: [
      {
        role: "system",
        content: `
Você é o interpretador de intenção de busca do VemVer.

O VemVer ajuda pessoas a encontrar lojas, produtos e serviços próximos.

Sua única função é transformar o pedido do usuário em filtros estruturados.

Regras:

- termoBusca deve conter o principal produto, serviço ou tipo de estabelecimento procurado.
- categoria deve ser uma categoria genérica quando for possível identificar.
- delivery deve ser true apenas quando o usuário pedir entrega ou delivery.
- abertoAgora deve ser true quando o usuário disser que precisa de algo aberto agora, hoje ou neste momento.
- pertoDeMim deve ser true quando o usuário pedir algo próximo, perto, na região ou semelhante.
- preco:
  - "baixo" para barato, econômico ou promoção.
  - "medio" quando houver indicação de preço intermediário.
  - "alto" para premium, luxo, sofisticado ou semelhante.
  - null quando não houver indicação de preço.
- Não invente informações que o usuário não forneceu.
        `.trim(),
      },
      {
        role: "user",
        content: mensagemLimpa,
      },
    ],

    text: {
      format: {
        type: "json_schema",
        name: "intencao_busca_vemver",
        strict: true,
        schema: {
          type: "object",
          properties: {
            termoBusca: {
              type: "string",
            },
            categoria: {
              type: ["string", "null"],
            },
            delivery: {
              type: ["boolean", "null"],
            },
            abertoAgora: {
              type: ["boolean", "null"],
            },
            pertoDeMim: {
              type: ["boolean", "null"],
            },
            preco: {
              type: ["string", "null"],
              enum: ["baixo", "medio", "alto", null],
            },
          },
          required: [
            "termoBusca",
            "categoria",
            "delivery",
            "abertoAgora",
            "pertoDeMim",
            "preco",
          ],
          additionalProperties: false,
        },
      },
    },
  })

  if (!resposta.output_text) {
    throw new Error(
      "A IA não retornou uma intenção de busca válida."
    )
  }

  const intencao = JSON.parse(
    resposta.output_text
  ) as IntencaoBusca

  return intencao
}