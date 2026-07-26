import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  "https://bwyqesogduegtoookdhu.supabase.co"

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""

type RegistrarHistoricoParams = {
  lojaId: number
  evento: string
  planoAnterior?: string | null
  planoNovo?: string | null
  mensagem?: string | null
  usuarioId?: string | null
  valor?: number | null
  referencia?: string | null
}

export async function registrarHistorico({
  lojaId,
  evento,
  planoAnterior = null,
  planoNovo = null,
  mensagem = null,
  usuarioId = null,
  valor = null,
  referencia = null,
}: RegistrarHistoricoParams) {
  if (!supabaseServiceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada"
    )
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey
  )

  const { data, error } = await supabaseAdmin
    .from("historico_assinaturas")
    .insert([
      {
        loja_id: lojaId,
        evento,
        plano_anterior: planoAnterior,
        plano_novo: planoNovo,
        mensagem,
        usuario_id: usuarioId,
        valor,
        referencia,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(
      "Erro ao registrar histórico:",
      error
    )

    throw new Error(
      `Erro ao registrar histórico: ${error.message}`
    )
  }

  return data
}