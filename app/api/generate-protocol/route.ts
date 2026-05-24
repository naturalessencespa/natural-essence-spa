import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const {
      serviceName,
      duration,
      description,
    } = body;

    const completion =
      await openai.chat.completions.create({

        model: "gpt-4.1-mini",

        messages: [

          {
            role: "system",

            content:
              "Eres experto en protocolos profesionales de spa y estética.",
          },

          {
            role: "user",

            content: `
Genera un protocolo profesional detallado para este servicio:

Servicio:
${serviceName}

Duración:
${duration}

Descripción:
${description}

Incluye:
- pasos
- tiempos
- recomendaciones
- productos sugeridos
- cierre del servicio
`,
          },

        ],

      });

    const protocol =
      completion.choices[0]
        ?.message?.content || "";

    return NextResponse.json({
      protocol,
    });

  } catch (error: any) {

    console.log(
      "OPENAI ERROR:",
      error
    );

    return NextResponse.json({

      error:
        error?.message ||

        "Error generando protocolo",

    });

  }

}