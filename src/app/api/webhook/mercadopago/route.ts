import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const mpClient = new MercadoPagoConfig({
  accessToken: mercadoPagoToken,
});
console.log("TOKEN WEBHOOK:");
console.log(mercadoPagoToken.substring(0, 20));
console.log("TOKEN WEBHOOK:");
console.log(
  mercadoPagoToken.substring(0, 25)
);
console.log("TOKEN WEBHOOK:", mercadoPagoToken.substring(0, 35));

export async function GET() {
  return NextResponse.json({
    ok: true,
    webhook: "mercadopago",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);

    console.log("========== WEBHOOK MERCADO PAGO ==========");
    console.dir(body, { depth: null });

    const topic =
      body?.topic ||
      body?.type ||
      url.searchParams.get("topic");

    const id =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get("id") ||
      body?.resource?.split("/")?.pop();

    console.log("TOPIC:", topic);
    console.log("RESOURCE:", body?.resource);
    console.log("DATA:", body?.data);
    console.log("ID RECEBIDO:", id);

    if (!id) {
      return NextResponse.json({
        recebido: true,
        motivo: "Sem ID",
      });
    }

    let paymentId = String(id);

    if (topic === "merchant_order") {
      console.log("CONSULTANDO MERCHANT ORDER:", id);

      const merchantOrder = new MerchantOrder(mpClient);

      const merchantOrderData: any = await merchantOrder.get({
        merchantOrderId: String(id),
      });

      console.log("MERCHANT ORDER:");
      console.dir(merchantOrderData, { depth: null });

      const pagamentoAprovado = merchantOrderData.payments?.find(
        (p: any) => p.status === "approved"
      );

      const primeiroPagamento = merchantOrderData.payments?.[0];

      paymentId = String(
        pagamentoAprovado?.id ||
          primeiroPagamento?.id ||
          ""
      );

      console.log("PAYMENT ID EXTRAÍDO:", paymentId);

      if (!paymentId) {
        return NextResponse.json({
          recebido: true,
          motivo: "Merchant order sem pagamento",
        });
      }
    }

    console.log("CONSULTANDO PAYMENT:", paymentId);

    const payment = new Payment(mpClient);

    const paymentData: any = await payment.get({
      id: paymentId,
    });

    console.log("PAYMENT:");
    console.dir(paymentData, { depth: null });

    const status = paymentData.status;
    const preferenceId = paymentData.preference_id;
    const lojaId =
      paymentData.metadata?.loja_id ||
      paymentData.external_reference;

    console.log("STATUS:", status);
    console.log("PREFERENCE:", preferenceId);
    console.log("LOJA:", lojaId);

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

    console.log("PAGAMENTO SUPABASE:");
    console.dir(pagamento, { depth: null });

    if (pagamentoError || !pagamento) {
      console.log("PAGAMENTO NÃO ENCONTRADO:");
      console.dir(pagamentoError, { depth: null });

      return NextResponse.json({
        recebido: true,
        motivo: "Pagamento não encontrado",
        preferenceId,
      });
    }

    await supabaseAdmin
      .from("pagamentos")
      .update({
        status,
        mp_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pagamento.id);

    console.log("PAGAMENTO ATUALIZADO");

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

    console.log("ATUALIZANDO LOJA:", lojaId);
    console.dir(atualizacaoLoja, { depth: null });

    const { error: lojaError } = await supabaseAdmin
      .from("lojas")
      .update(atualizacaoLoja)
      .eq("id", Number(lojaId));

    if (lojaError) {
      console.log("ERRO ATUALIZANDO LOJA:");
      console.dir(lojaError, { depth: null });
    } else {
      console.log("LOJA ATUALIZADA COM SUCESSO");
    }

    return NextResponse.json({
      recebido: true,
      status,
      plano,
      lojaId,
      paymentId,
    });
  } catch (error: any) {
    console.log("========== ERRO WEBHOOK ==========");
    console.dir(error, { depth: null });

    return NextResponse.json(
      {
        error: "Erro webhook",
        detalhes: error?.message || error,
        cause: error?.cause || null,
        status: error?.status || null,
      },
      { status: 500 }
    );
  }
}