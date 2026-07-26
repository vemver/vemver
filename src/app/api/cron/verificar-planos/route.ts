import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://bwyqesogduegtoookdhu.supabase.co";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

type LojaAviso = {
  id: number;
  nome: string;
  plano: string;
  plano_vencimento: string;
  aviso_7_dias: boolean;
  aviso_3_dias: boolean;
  aviso_1_dia: boolean;
};

function criarIntervaloDoDia(diasAFrente: number) {
  const inicio = new Date();

  inicio.setUTCDate(
    inicio.getUTCDate() + diasAFrente
  );

  inicio.setUTCHours(0, 0, 0, 0);

  const fim = new Date(inicio);

  fim.setUTCHours(23, 59, 59, 999);

  return {
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  };
}

async function buscarLojasParaAviso(
  supabaseAdmin: ReturnType<typeof createClient>,
  diasAFrente: number,
  colunaAviso:
    | "aviso_7_dias"
    | "aviso_3_dias"
    | "aviso_1_dia"
) {
  const intervalo =
    criarIntervaloDoDia(diasAFrente);

  const { data, error } = await supabaseAdmin
    .from("lojas")
    .select(
      `
        id,
        nome,
        plano,
        plano_vencimento,
        aviso_7_dias,
        aviso_3_dias,
        aviso_1_dia
      `
    )
    .eq("assinatura_status", "ativa")
    .eq(colunaAviso, false)
    .not("plano_vencimento", "is", null)
    .gte(
      "plano_vencimento",
      intervalo.inicio
    )
    .lte(
      "plano_vencimento",
      intervalo.fim
    );

  if (error) {
    throw new Error(
      `Erro ao buscar aviso de ${diasAFrente} dia(s): ${error.message}`
    );
  }

  return (data || []) as LojaAviso[];
}

export async function GET() {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        {
          sucesso: false,
          erro:
            "SUPABASE_SERVICE_ROLE_KEY não configurada",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const agora = new Date();
    const agoraIso = agora.toISOString();

    /*
     * 1. Identifica lojas que precisam receber avisos.
     *
     * Nesta etapa ainda não enviamos mensagens
     * e não alteramos os campos aviso_7_dias,
     * aviso_3_dias e aviso_1_dia.
     */
    const [
      lojasAviso7Dias,
      lojasAviso3Dias,
      lojasAviso1Dia,
    ] = await Promise.all([
      buscarLojasParaAviso(
        supabaseAdmin,
        7,
        "aviso_7_dias"
      ),

      buscarLojasParaAviso(
        supabaseAdmin,
        3,
        "aviso_3_dias"
      ),

      buscarLojasParaAviso(
        supabaseAdmin,
        1,
        "aviso_1_dia"
      ),
    ]);

    /*
     * 2. Localiza assinaturas ativas que venceram.
     *
     * Elas continuam com os benefícios
     * e entram em 3 dias de cortesia.
     */
    const {
      data: lojasParaCortesia,
      error: buscaCortesiaError,
    } = await supabaseAdmin
      .from("lojas")
      .select(
        `
          id,
          nome,
          plano,
          plano_vencimento,
          assinatura_status
        `
      )
      .eq("assinatura_status", "ativa")
      .not("plano_vencimento", "is", null)
      .lt("plano_vencimento", agoraIso);

    if (buscaCortesiaError) {
      console.error(
        "Erro ao buscar lojas para cortesia:",
        buscaCortesiaError
      );

      return NextResponse.json(
        {
          sucesso: false,
          erro:
            "Erro ao buscar assinaturas vencidas",
          detalhes:
            buscaCortesiaError.message,
        },
        { status: 500 }
      );
    }

    let lojasEmCortesia = 0;

    if (
      lojasParaCortesia &&
      lojasParaCortesia.length > 0
    ) {
      const fimDaCortesia = new Date(agora);

      fimDaCortesia.setDate(
        fimDaCortesia.getDate() + 3
      );

      const idsParaCortesia =
        lojasParaCortesia.map(
          (loja) => loja.id
        );

      const { error: ativarCortesiaError } =
        await supabaseAdmin
          .from("lojas")
          .update({
            assinatura_status: "cortesia",
            cortesia_ate:
              fimDaCortesia.toISOString(),
            aviso_vencido: false,
            renovacao_automatica: false,
          })
          .in("id", idsParaCortesia);

      if (ativarCortesiaError) {
        console.error(
          "Erro ao ativar período de cortesia:",
          ativarCortesiaError
        );

        return NextResponse.json(
          {
            sucesso: false,
            erro:
              "Erro ao ativar período de cortesia",
            detalhes:
              ativarCortesiaError.message,
          },
          { status: 500 }
        );
      }

      lojasEmCortesia =
        lojasParaCortesia.length;
    }

    /*
     * 3. Localiza lojas cujo período
     * de cortesia já terminou.
     */
    const {
      data: lojasComCortesiaVencida,
      error: buscaVencidasError,
    } = await supabaseAdmin
      .from("lojas")
      .select(
        `
          id,
          nome,
          plano,
          cortesia_ate,
          assinatura_status
        `
      )
      .eq("assinatura_status", "cortesia")
      .not("cortesia_ate", "is", null)
      .lt("cortesia_ate", agoraIso);

    if (buscaVencidasError) {
      console.error(
        "Erro ao buscar cortesias vencidas:",
        buscaVencidasError
      );

      return NextResponse.json(
        {
          sucesso: false,
          erro:
            "Erro ao buscar períodos de cortesia vencidos",
          detalhes:
            buscaVencidasError.message,
        },
        { status: 500 }
      );
    }

    let lojasRetornadasAoGratis = 0;

    if (
      lojasComCortesiaVencida &&
      lojasComCortesiaVencida.length > 0
    ) {
      const idsCortesiaVencida =
        lojasComCortesiaVencida.map(
          (loja) => loja.id
        );

      const { error: voltarGratisError } =
        await supabaseAdmin
          .from("lojas")
          .update({
            plano: "gratis",
            premium: false,
            patrocinado: false,
            limite_lojas: 1,
            assinatura_status: "vencida",
            plano_periodo: null,
            plano_inicio: null,
            plano_vencimento: null,
            cortesia_ate: null,
            renovacao_automatica: false,
          })
          .in("id", idsCortesiaVencida);

      if (voltarGratisError) {
        console.error(
          "Erro ao retornar lojas ao plano grátis:",
          voltarGratisError
        );

        return NextResponse.json(
          {
            sucesso: false,
            erro:
              "Erro ao retornar lojas ao plano grátis",
            detalhes:
              voltarGratisError.message,
          },
          { status: 500 }
        );
      }

      lojasRetornadasAoGratis =
        lojasComCortesiaVencida.length;
    }

    return NextResponse.json({
      sucesso: true,
      mensagem:
        "Verificação de assinaturas concluída.",

      avisosPendentes: {
        seteDias: lojasAviso7Dias.length,
        tresDias: lojasAviso3Dias.length,
        umDia: lojasAviso1Dia.length,
      },

      lojasParaAviso: {
        seteDias: lojasAviso7Dias.map(
          (loja) => ({
            id: loja.id,
            nome: loja.nome,
            plano: loja.plano,
            vencimento:
              loja.plano_vencimento,
          })
        ),

        tresDias: lojasAviso3Dias.map(
          (loja) => ({
            id: loja.id,
            nome: loja.nome,
            plano: loja.plano,
            vencimento:
              loja.plano_vencimento,
          })
        ),

        umDia: lojasAviso1Dia.map(
          (loja) => ({
            id: loja.id,
            nome: loja.nome,
            plano: loja.plano,
            vencimento:
              loja.plano_vencimento,
          })
        ),
      },

      lojasEmCortesia,

      lojasRetornadasAoGratis,

      cortesiaIniciada: (
        lojasParaCortesia || []
      ).map((loja) => ({
        id: loja.id,
        nome: loja.nome,
        plano: loja.plano,
        vencimento:
          loja.plano_vencimento,
      })),

      cortesiaEncerrada: (
        lojasComCortesiaVencida || []
      ).map((loja) => ({
        id: loja.id,
        nome: loja.nome,
        planoAnterior: loja.plano,
        cortesiaAte: loja.cortesia_ate,
      })),
    });
  } catch (error: any) {
    console.error(
      "Erro inesperado ao verificar planos:",
      error?.message || error
    );

    return NextResponse.json(
      {
        sucesso: false,
        erro:
          "Erro inesperado ao verificar planos",
        detalhes:
          error?.message ||
          "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}