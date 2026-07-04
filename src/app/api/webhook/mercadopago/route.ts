import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
);

const mpClient = new MercadoPagoConfig({
  accessToken: mercadoPagoToken,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("========== WEBHOOK MERCADO PAGO ==========");
    console.dir(body, { depth: null });

const paymentId =
  body?.data?.id ??
  body?.resource?.split("/")?.pop() ??
  body?.id;

console.log("BODY RECEBIDO:");
console.dir(body, { depth: null });

console.log("PAYMENT ID:", paymentId);

    if (!paymentId) {
      return NextResponse.json({
        recebido: true,
        motivo: "Sem paymentId",
      });
    }

    const payment = new Payment(mpClient);
    console.log("CONSULTANDO PAGAMENTO:", paymentId);

    const paymentData: any = await payment.get({
      id: String(paymentId),
    });

    console.log("========== PAGAMENTO ==========");
    console.dir(paymentData, { depth: null });

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

    const { data: pagamento, error: pagamentoError } =
      await supabaseAdmin
        .from("pagamentos")
        .select("*")
        .eq("mp_preference_id", preferenceId)
        .single();

    if (pagamentoError || !pagamento) {
      console.log("Pagamento não encontrado:");
      console.dir(pagamentoError, { depth: null });

      return NextResponse.json({
        recebido: true,
        motivo: "Pagamento não encontrado",
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
      console.log("Pagamento ainda não aprovado:", status);

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
        premium: true,
        patrocinado: false,
        limite_lojas: 1,
      };
    }

    if (plano === "patrocinado") {
      atualizacaoLoja = {
        plano: "patrocinado",
        premium: true,
        patrocinado: true,
        limite_lojas: 1,
      };
    }

    if (plano === "multiunidade") {
      atualizacaoLoja = {
        plano: "multiunidade",
        premium: true,
        patrocinado: false,
        limite_lojas: 5,
      };
    }

    const { error: lojaError } = await supabaseAdmin
      .from("lojas")
      .update(atualizacaoLoja)
      .eq("id", Number(lojaId));

    if (lojaError) {
      console.log("Erro ao atualizar loja:");
      console.dir(lojaError, { depth: null });
    } else {
      console.log("LOJA ATUALIZADA COM SUCESSO!");
    }

    return NextResponse.json({
      recebido: true,
      status,
      plano,
      lojaId,
    });
  } catch (error: any) {
    console.log("========== ERRO WEBHOOK ==========");
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
export async function GET() {
  return NextResponse.json({
    ok: true,
    webhook: "mercadopago",
  });
}