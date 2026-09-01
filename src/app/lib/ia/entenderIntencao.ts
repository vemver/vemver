import "server-only"
import OpenAI from "openai"

export type IntencaoBusca = {
  termoBusca: string
  categoria: string | null
  termosRelacionados: string[]
  termosContexto: string[]
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
    throw new Error(
      "A mensagem do usuário não pode estar vazia."
    )
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

Sua função é somente interpretar o pedido do usuário e transformá-lo em critérios estruturados.

Você NÃO consulta banco de dados.
Você NÃO escolhe lojas.
Você NÃO define o ranking final.
Você NÃO afirma que um estabelecimento possui algo.

REGRAS GERAIS

- termoBusca deve representar o principal produto, serviço ou tipo de estabelecimento procurado.

- categoria deve representar uma categoria genérica relacionada à intenção quando isso puder ser identificado com segurança.

TERMOS RELACIONADOS

- termosRelacionados deve conter palavras ou expressões curtas que possam ajudar a recuperar candidatos potencialmente relevantes.

- Pode incluir:
  - sinônimos;
  - variações de mercado;
  - formas comuns de descrever o serviço;
  - conceitos diretamente relacionados.

- Use no máximo 8 termos.

- Evite termos excessivamente distantes da intenção.

CONTEXTO ESSENCIAL

- termosContexto representa o objeto, segmento ou domínio essencial ao qual a intenção se aplica.

- Esses termos serão usados pelo backend para evitar falsos positivos.

- termosContexto NÃO deve conter apenas verbos ou ações genéricas como:
  - reparo;
  - conserto;
  - manutenção;
  - assistência;
  - venda;
  - compra.

- Prefira identificar aquilo que diferencia semanticamente a necessidade.

Exemplo 1:

Usuário:
"assistência notebook"

termoBusca:
"assistência notebook"

categoria:
"assistência técnica"

termosRelacionados:
[
  "reparo",
  "conserto",
  "manutenção",
  "informática",
  "eletrônicos",
  "notebook"
]

termosContexto:
[
  "notebook",
  "computador",
  "informática",
  "eletrônicos"
]

Uma loja descrita como "reparos eletrônicos" pode ser candidata porque existe compatibilidade entre ação e contexto.

Exemplo 2:

Usuário:
"assistência geladeira"

termoBusca:
"assistência geladeira"

categoria:
"assistência técnica"

termosRelacionados:
[
  "reparo",
  "conserto",
  "manutenção",
  "geladeira",
  "refrigerador",
  "eletrodomésticos",
  "refrigeração"
]

termosContexto:
[
  "geladeira",
  "refrigerador",
  "eletrodomésticos",
  "refrigeração"
]

Nesse caso, "reparos eletrônicos" sozinho NÃO representa contexto suficiente.

Exemplo 3:

Usuário:
"iphone pro"

termosContexto pode conter:
[
  "iphone",
  "smartphone",
  "celular"
]

Exemplo 4:

Usuário:
"loja"

Como não existe domínio específico obrigatório:

termosContexto:
[]

OUTROS FILTROS

- delivery deve ser true apenas quando o usuário pedir entrega ou delivery.

- abertoAgora deve ser true quando o usuário disser que precisa de algo aberto agora, hoje ou neste momento.

- pertoDeMim deve ser true quando o usuário pedir algo próximo, perto, na região ou semelhante.

- preco:
  - "baixo" para barato, econômico ou promoção.
  - "medio" quando houver indicação de preço intermediário.
  - "alto" para premium, luxo, sofisticado ou semelhante.
  - null quando não houver indicação de preço.

- Não invente informações factuais sobre lojas, produtos ou disponibilidade.
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

            termosRelacionados: {
              type: "array",
              items: {
                type: "string",
              },
              maxItems: 8,
            },

            termosContexto: {
              type: "array",
              items: {
                type: "string",
              },
              maxItems: 8,
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
              enum: [
                "baixo",
                "medio",
                "alto",
                null,
              ],
            },
          },

          required: [
            "termoBusca",
            "categoria",
            "termosRelacionados",
            "termosContexto",
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

  const termosRelacionados =
    Array.isArray(
      intencao.termosRelacionados
    )
      ? intencao.termosRelacionados
          .map((termo) =>
            String(termo).trim()
          )
          .filter(Boolean)
          .slice(0, 8)
      : []

  const termosContexto =
    Array.isArray(
      intencao.termosContexto
    )
      ? intencao.termosContexto
          .map((termo) =>
            String(termo).trim()
          )
          .filter(Boolean)
          .slice(0, 8)
      : []

  return {
    ...intencao,

    termoBusca:
      String(
        intencao.termoBusca || ""
      ).trim(),

    categoria:
      intencao.categoria?.trim() ||
      null,

    termosRelacionados,

    termosContexto,
  }
}