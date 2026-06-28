import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const mpClient = new MercadoPagoConfig({
  accessToken: mercadoPagoToken,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("WEBHOOK MERCADO PAGO:");
    console.log(body);

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split("/")?.pop();

    if (!paymentId) {
      return NextResponse.json({
        recebido: true,
        motivo: "Sem paymentId",
      });
    }

    const payment = new Payment(mpClient);

    const paymentData: any = await payment.get({
      id: String(paymentId),
    });

    console.log("PAGAMENTO MP:");
    console.log(paymentData);

    const status = paymentData.status;
    const preferenceId = paymentData.preference_id;
    const lojaId =
      paymentData.metadata?.loja_id ||
      paymentData.external_reference;

    if (!preferenceId || !lojaId) {
      return NextResponse.json({
        recebido: true,
        motivo: "Sem preferenceId ou lojaId",
      });
    }

    const { data: pagamento, error: pagamentoError } = await supabaseAdmin
      .from("pagamentos")
      .select("*")
      .eq("mp_preference_id", preferenceId)
      .single();

    if (pagamentoError || !pagamento) {
      console.log("Pagamento não encontrado:", pagamentoError);

      return NextResponse.json({
        recebido: true,
        motivo: "Pagamento não encontrado no banco",
      });
    }

    await supabaseAdmin
      .from("pagamentos")
      .update({
        status,
        mp_payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      })
      .eq("id", pagamento.id);

    if (status !== "approved") {
      return NextResponse.json({
        recebido: true,
        status,
      });
    }

    const plano = pagamento.plano;

    let atualizacaoLoja: any = {
      plano,
    };

    if (plano === "premium") {
      atualizacaoLoja = {
        plano: "premium",
        patrocinado: false,
        limite_lojas: 1,
      };
    }

    if (plano === "patrocinado") {
      atualizacaoLoja = {
        plano: "patrocinado",
        patrocinado: true,
        limite_lojas: 1,
      };
    }

    if (plano === "multiunidade") {
      atualizacaoLoja = {
        plano: "multiunidade",
        patrocinado: false,
        limite_lojas: 5,
      };
    }

    await supabaseAdmin
      .from("lojas")
      .update(atualizacaoLoja)
      .eq("id", Number(lojaId));

    return NextResponse.json({
      recebido: true,
      status,
      plano,
      lojaId,
    });
  } catch (error: any) {
    console.log("ERRO WEBHOOK:");
    console.dir(error, { depth: null });

    return NextResponse.json(
      {
        error: "Erro no webhook",
        detalhes: error?.message || error,
      },
      {
        status: 500,
      }
    );
  }
}