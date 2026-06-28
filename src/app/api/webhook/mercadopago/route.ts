import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("WEBHOOK RECEBIDO:");
    console.log(body);

    return NextResponse.json({
      recebido: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Erro no webhook",
      },
      {
        status: 500,
      }
    );
  }
}