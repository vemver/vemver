"use client"

type PeriodoPlano =
  | "mensal"
  | "trimestral"
  | "anual"

type Plano = {
  id: number
  codigo: string
  nome: string
  periodo: PeriodoPlano
  meses: number
  preco: number
  limite_lojas: number | null
  limite_produtos: number | null
  limite_imagens_produto: number | null
  permite_promocao: boolean
  permite_destaque: boolean
  prioridade_busca: number
  estatisticas_nivel: string
  ativo: boolean
}

type PlanoCardProps = {
  titulo: string
  icone: string
  cor: string
  codigo: string
  planos: Plano[]
  planoAtual: string | null
  onSelecionar: (
    codigo: string,
    periodo: PeriodoPlano
  ) => void
}

function formatarPreco(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function formatarPeriodo(periodo: PeriodoPlano) {
  const periodos: Record<PeriodoPlano, string> = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    anual: "Anual",
  }

  return periodos[periodo]
}

function obterBeneficios(
  codigo: string,
  planoReferencia?: Plano
) {
  const limiteProdutos =
    planoReferencia?.limite_produtos

  const limiteLojas =
    planoReferencia?.limite_lojas

  const limiteImagens =
    planoReferencia?.limite_imagens_produto

  const beneficios: string[] = []

  if (limiteLojas) {
    beneficios.push(
      limiteLojas === 1
        ? "1 loja cadastrada"
        : `Até ${limiteLojas} lojas`
    )
  }

  if (limiteProdutos) {
    beneficios.push(
      `Até ${limiteProdutos} produtos`
    )
  }

  if (limiteImagens) {
    beneficios.push(
      `Até ${limiteImagens} imagens por produto`
    )
  }

  if (planoReferencia?.permite_promocao) {
    beneficios.push("Produtos em promoção")
  }

  if (planoReferencia?.permite_destaque) {
    beneficios.push("Produtos em destaque")
  }

  if (
    planoReferencia?.estatisticas_nivel ===
    "completo"
  ) {
    beneficios.push("Estatísticas completas")
  }

  if (
    planoReferencia?.estatisticas_nivel ===
    "avancado"
  ) {
    beneficios.push("Estatísticas avançadas")
  }

  if (codigo === "patrocinado") {
    beneficios.push("Maior prioridade nas buscas")
  }

  if (codigo === "multiunidade") {
    beneficios.push("Gestão de múltiplas unidades")
  }

  return beneficios.slice(0, 5)
}

export default function PlanoCard({
  titulo,
  icone,
  cor,
  codigo,
  planos,
  planoAtual,
  onSelecionar,
}: PlanoCardProps) {
  const planosDoCard = planos
    .filter(
      (plano) =>
        plano.codigo
          .trim()
          .toLowerCase() ===
          codigo.trim().toLowerCase() &&
        plano.ativo === true
    )
    .sort(
      (planoA, planoB) =>
        Number(planoA.meses) -
        Number(planoB.meses)
    )

  const planoMensal = planosDoCard.find(
    (plano) => plano.periodo === "mensal"
  )

  const planoReferencia =
    planoMensal || planosDoCard[0]

  const beneficios = obterBeneficios(
    codigo,
    planoReferencia
  )

  const codigoAtual = String(
    planoAtual || "gratis"
  )
    .trim()
    .toLowerCase()

  const esteEPlanoAtual =
    codigoAtual ===
    codigo.trim().toLowerCase()

  const planoRecomendado =
    codigo.trim().toLowerCase() ===
    "patrocinado"

  function calcularEconomia(plano: Plano) {
    if (
      !planoMensal ||
      plano.periodo === "mensal"
    ) {
      return 0
    }

    const valorSemDesconto =
      Number(planoMensal.preco) *
      Number(plano.meses)

    return Math.max(
      0,
      valorSemDesconto -
        Number(plano.preco)
    )
  }

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border p-6 shadow-xl transition duration-300 ${
        planoRecomendado
          ? "border-blue-400/60 bg-blue-500/5 shadow-blue-500/10"
          : "border-white/10 bg-zinc-900"
      }`}
    >
      {planoRecomendado && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
          Mais recomendado
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl">
          {icone}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Plano
          </p>

          <h2 className="mt-1 text-2xl font-black text-white">
            {titulo}
          </h2>
        </div>
      </div>

      {beneficios.length > 0 && (
        <div className="mt-6 space-y-3">
          {beneficios.map((beneficio) => (
            <div
              key={beneficio}
              className="flex items-start gap-3 text-sm text-zinc-300"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-400/15 text-xs font-black text-green-300">
                ✓
              </span>

              <span>{beneficio}</span>
            </div>
          ))}
        </div>
      )}

      {planosDoCard.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          Nenhuma opção disponível para este
          plano.
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {planosDoCard.map((plano) => {
            const economia =
              calcularEconomia(plano)

            const valorMensal =
              Number(plano.preco) /
              Number(plano.meses || 1)

            return (
              <div
                key={plano.id}
                className={`overflow-hidden rounded-2xl border transition ${
                  esteEPlanoAtual
                    ? "border-white/5 bg-zinc-800/70 opacity-60"
                    : "border-white/10 bg-black/20 hover:-translate-y-1 hover:border-white/25"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-white">
                        {formatarPeriodo(
                          plano.periodo
                        )}
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        {plano.meses === 1
                          ? "1 mês de acesso"
                          : `${plano.meses} meses de acesso`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-white">
                        {formatarPreco(
                          Number(plano.preco)
                        )}
                      </p>

                      {plano.periodo !==
                        "mensal" && (
                        <p className="mt-1 text-xs text-zinc-400">
                          {formatarPreco(
                            valorMensal
                          )}
                          /mês
                        </p>
                      )}
                    </div>
                  </div>

                  {economia > 0 && (
                    <div className="mt-3 rounded-xl bg-green-400/10 px-3 py-2 text-sm font-bold text-green-300">
                      Economize{" "}
                      {formatarPreco(economia)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={esteEPlanoAtual}
                  onClick={() =>
                    onSelecionar(
                      codigo,
                      plano.periodo
                    )
                  }
                  style={{
                    background: esteEPlanoAtual
                      ? undefined
                      : cor,
                  }}
                  className={`w-full border-t border-white/10 px-4 py-3 text-sm font-black transition ${
                    esteEPlanoAtual
                      ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                      : "text-white hover:brightness-110"
                  }`}
                >
                  {esteEPlanoAtual
                    ? "Plano já contratado"
                    : `Escolher ${formatarPeriodo(
                        plano.periodo
                      )}`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {esteEPlanoAtual && (
        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-green-500/25 bg-green-500/10 p-4 text-center font-black text-green-300">
            ✓ Este é o seu plano atual
          </div>
        </div>
      )}
    </article>
  )
}