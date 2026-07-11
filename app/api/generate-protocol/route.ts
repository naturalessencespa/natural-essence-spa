import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      serviceName,
      duration,
      description,
    } = body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en protocolos profesionales de spa y estética. Genera protocolos claros, ordenados y prácticos.",
        },
        {
          role: "user",
          content: `
Genera un protocolo profesional para el siguiente servicio.

Servicio:
${serviceName}

Duración:
${duration}

Descripción:
${description}

El protocolo debe incluir:

1. Objetivo del servicio.
2. Materiales y productos necesarios.
3. Preparación del cliente.
4. Procedimiento paso a paso.
5. Tiempo aproximado de cada etapa.
6. Recomendaciones durante el procedimiento.
7. Cuidados posteriores.
8. Contraindicaciones.
9. Observaciones importantes.

Redáctalo de forma profesional para que pueda ser utilizado por las cosmetólogas del spa.
`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const protocol =
      completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({
      protocol,
    });
  } catch (error: any) {
    console.error("OPENAI ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Error generando protocolo",
      },
      {
        status: 500,
      }
    );
  }
}