import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {

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

    return Response.json({
      protocol,
    });

  } catch (error) {

    console.log(
      "OPENAI ERROR:",
      error
    );

    return Response.json({

      error:
        error?.message ||

        "Error generando protocolo",

    });

  }

}