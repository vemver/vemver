import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

function criarClienteSupabaseServidor() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não foi encontrada."
    )
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não foi encontrada."
    )
  }

  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

export async function GET(request: Request) {
  try {
    const cronSecret =
      process.env.CRON_SECRET

    if (!cronSecret) {
      console.error(
        "CRON_SECRET não foi configurado."
      )

      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Configuração de segurança do cron ausente.",
        },
        {
          status: 500,
        }
      )
    }

    const authorization =
      request.headers.get("authorization")

    if (
      authorization !==
      `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Não autorizado.",
        },
        {
          status: 401,
        }
      )
    }

    const supabase =
      criarClienteSupabaseServidor()

    const { error } = await supabase.rpc(
      "atualizar_score_lojas"
    )

    if (error) {
      console.error(
        "Erro ao atualizar scores das lojas:",
        error
      )

      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Não foi possível atualizar os scores das lojas.",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      sucesso: true,
      mensagem:
        "Scores das lojas atualizados com sucesso.",
      executadoEm:
        new Date().toISOString(),
    })
  } catch (erro) {
    console.error(
      "Erro inesperado no cron de scores:",
      erro
    )

    return NextResponse.json(
      {
        sucesso: false,
        mensagem:
          erro instanceof Error
            ? erro.message
            : "Erro inesperado ao atualizar scores.",
      },
      {
        status: 500,
      }
    )
  }
}