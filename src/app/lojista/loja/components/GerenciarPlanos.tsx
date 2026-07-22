"use client"

import { useState } from "react"
import PlanoCard from "./PlanoCard"
import PlanoModal from "./PlanoModal"

type PeriodoPlano =
  | "mensal"
  | "trimestral"
  | "anual"

export type PlanoCatalogo = {
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

type GerenciarPlanosProps = {
  planos: PlanoCatalogo[]
  planoAtual: string | null
  processandoPagamento?: boolean
  onConfirmarPagamento: (
    plano: PlanoCatalogo
  ) => Promise<void> | void
}

export default function GerenciarPlanos({
  planos,
  planoAtual,
  processandoPagamento = false,
  onConfirmarPagamento,
}: GerenciarPlanosProps) {
  const [planoSelecionado, setPlanoSelecionado] =
    useState<PlanoCatalogo | null>(null)

  function selecionarPlano(
    codigo: string,
    periodo: PeriodoPlano
  ) {
    const opcao = planos.find(
      (plano) =>
        plano.codigo === codigo &&
        plano.periodo === periodo
    )

    if (!opcao) {
      alert(
        "Não foi possível localizar essa opção de assinatura."
      )
      return
    }

    setPlanoSelecionado(opcao)
  }

  function fecharModal() {
    if (processandoPagamento) return

    setPlanoSelecionado(null)
  }

  async function confirmarPagamento() {
    if (!planoSelecionado) return

    await onConfirmarPagamento(
      planoSelecionado
    )
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-3">
        <PlanoCard
          titulo="Premium"
          icone="⭐"
          cor="linear-gradient(135deg, #facc15, #ca8a04)"
          codigo="premium"
          planos={planos}
          planoAtual={planoAtual}
          onSelecionar={selecionarPlano}
        />

        <PlanoCard
          titulo="Patrocinado"
          icone="🚀"
          cor="linear-gradient(135deg, #3b82f6, #1d4ed8)"
          codigo="patrocinado"
          planos={planos}
          planoAtual={planoAtual}
          onSelecionar={selecionarPlano}
        />

        <PlanoCard
          titulo="Multiunidade"
          icone="🏢"
          cor="linear-gradient(135deg, #a855f7, #7e22ce)"
          codigo="multiunidade"
          planos={planos}
          planoAtual={planoAtual}
          onSelecionar={selecionarPlano}
        />
      </div>

      <PlanoModal
        plano={planoSelecionado}
        aberto={planoSelecionado !== null}
        processando={processandoPagamento}
        onFechar={fecharModal}
        onConfirmar={confirmarPagamento}
      />
    </>
  )
}