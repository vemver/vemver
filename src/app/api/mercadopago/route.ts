import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";
import { supabase } from "../../supabase";

const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

const client = new MercadoPagoConfig({
  accessToken: mercadoPagoToken,
});

export async function POST(request: Request) {
  try {
    if (!mercadoPagoToken) {
      return NextResponse.json(
        { error: "Credencial do Mercado Pago não configurada" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const plano = body.plano || "premium";
    const lojaId = body.loja_id;

    const planos = {
      premium: {
        titulo: "Plano Premium VemVer",
        preco: 49.9,
      },
      patrocinado: {
        titulo: "Plano Patrocinado VemVer",
        preco: 99.9,
      },
      multiunidade: {
        titulo: "Plano Multiunidade VemVer",
        preco: 149.9,
      },
    };

    const planoEscolhido = planos[plano as keyof typeof planos];

    if (!planoEscolhido || !lojaId) {
      return NextResponse.json(
        { error: "Plano ou loja inválida" },
        { status: 400 }
      );
    }

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: plano,
            title: planoEscolhido.titulo,
            quantity: 1,
            unit_price: planoEscolhido.preco,
            currency_id: "BRL",
          },
        ],

        external_reference: String(lojaId),

        metadata: {
          loja_id: Number(lojaId),
          plano,
        },

        notification_url:
          "https://vemverapp.com.br/api/webhook/mercadopago",

        back_urls: {
          success: "https://vemverapp.com.br/lojista",
          failure: "https://vemverapp.com.br/lojista",
          pending: "https://vemverapp.com.br/lojista",
        },
      },
    });

    const { error: pagamentoError } = await supabase
      .from("pagamentos")
      .insert([
        {
          loja_id: Number(lojaId),
          plano,
          valor: planoEscolhido.preco,
          status: "pending",
          mp_preference_id: response.id,
        },
      ]);

    if (pagamentoError) {
      console.error("Erro ao registrar pagamento:", pagamentoError);

      return NextResponse.json(
        { error: "Erro ao registrar pagamento" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      id: response.id,
    });
  } catch (error: any) {
    console.error("Erro ao criar pagamento:", error?.message || error);

    return NextResponse.json(
      {
        error: "Erro ao criar pagamento",
        detalhes: error?.message || "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}