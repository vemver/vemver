import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  "https://bwyqesogduegtoookdhu.supabase.co"

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""

type CriarNotificacaoParams = {
  lojaId: number
  titulo: string
  mensagem: string
  tipo: string
  icone?: string | null
  link?: string | null
}

export async function criarNotificacao({
  lojaId,
  titulo,
  mensagem,
  tipo,
  icone = null,
  link = null,
}: CriarNotificacaoParams) {
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
    .from("notificacoes")
    .insert([
      {
        loja_id: lojaId,
        titulo,
        mensagem,
        tipo,
        lida: false,
        icone,
        link,
        enviada_em: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(
      "Erro ao criar notificação:",
      error
    )

    throw new Error(
      `Erro ao criar notificação: ${error.message}`
    )
  }

  return data
}