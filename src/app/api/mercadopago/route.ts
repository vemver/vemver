import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";
import { supabase } from "../../supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
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
          loja_id: lojaId,
          plano,
        },
        back_urls: {
          success: "https://vemverapp.com.br/lojista",
          failure: "https://vemverapp.com.br/lojista",
          pending: "https://vemverapp.com.br/lojista",
        },
      },
    });

   const { data, error } = await supabase
  .from("pagamentos")
  .insert([
    {
      loja_id: Number(lojaId),
      plano,
      valor: planoEscolhido.preco,
      status: "pending",
      mp_preference_id: response.id,
    },
  ])
  .select();

console.log("INSERT PAGAMENTO:");
console.log("DATA:", data);
console.log("ERROR:", error);

    return NextResponse.json({
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      id: response.id,
    });
  } catch (error: any) {
    console.log("ERRO MERCADO PAGO:");
    console.dir(error, { depth: null });

    return NextResponse.json(
      {
        error: "Erro ao criar pagamento",
        detalhes: error?.message || error,
      },
      { status: 500 }
    );
  }
}