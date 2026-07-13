// Genera el plan estratégico de 4 semanas (resumen + eje temático por semana) de una campaña.
// Prerrequisito para poder generar los posts de cualquier semana (ver generar-semana-campana).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const COSTO_CREDITOS = 1200;
const GEMINI_MODEL = "gemini-2.5-flash";

function limpiarJson(texto: string): string {
  return texto.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campana_id, usuario_id } = await req.json();
    if (!campana_id) {
      return new Response(JSON.stringify({ error: "campana_id es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: campana, error: campanaError } = await supabase
      .from("campanas_cliente")
      .select("*, clientes(id, negocio_id, razon_social)")
      .eq("id", campana_id)
      .single();

    if (campanaError || !campana) {
      return new Response(JSON.stringify({ error: "Campaña no encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: identidad } = await supabase
      .from("analisis_identidad_cliente")
      .select("estilo_descripcion")
      .eq("cliente_id", campana.cliente_id)
      .maybeSingle();

    const contextoIdentidad = identidad?.estilo_descripcion
      ? `Identidad visual/tono de la marca: ${identidad.estilo_descripcion}`
      : "No hay análisis de identidad visual disponible: usá un tono profesional genérico.";

    const prompt = `
Sos un estratega de marketing digital senior de una agencia. Diseñá el plan de una campaña
de contenido de 4 semanas (30 días) para el cliente "${campana.clientes.razon_social}".

Datos de la campaña:
- Objetivo: ${campana.objetivo ?? "no especificado"}
- Fechas: ${campana.fecha_inicio ?? "sin definir"} a ${campana.fecha_fin ?? "sin definir"}
- Plataformas: ${(campana.plataformas ?? []).join(", ") || "no especificadas"}
- Público objetivo: ${campana.publico_objetivo ?? "no especificado"}
- Meta que el cliente quiere lograr (informativa, no la valides con datos): ${campana.meta_cuantificable ?? "no especificada"}
- Contexto adicional: ${campana.contexto_extra ?? "ninguno"}
${contextoIdentidad}

Sugerí una progresión estándar de agencia adaptada al objetivo real de la campaña (por
ejemplo: Semana 1 Awareness/Introducción, Semana 2 Engagement/Educación, Semana 3
Conversión/Oferta, Semana 4 Retención/Comunidad), pero ajustá los ejes si el objetivo de la
campaña sugiere otro orden.

Respondé ÚNICAMENTE con un JSON válido, sin texto adicional, con esta forma exacta:
{
  "resumen": "un párrafo ejecutivo de la estrategia completa",
  "pilares": [
    { "semana": 1, "eje": "string corto", "enfoque": "1-2 oraciones del enfoque de esa semana" },
    { "semana": 2, "eje": "string corto", "enfoque": "..." },
    { "semana": 3, "eje": "string corto", "enfoque": "..." },
    { "semana": 4, "eje": "string corto", "enfoque": "..." }
  ]
}`.trim();

    await supabase.rpc("descontar_saldo_marketing", {
      p_negocio_id: campana.clientes.negocio_id,
      p_monto: COSTO_CREDITOS,
      p_tipo: "generar_campana",
      p_descripcion: `Plan de campaña - ${campana.nombre_campana}`,
      p_usuario_id: usuario_id ?? null,
    });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini error: ${errText}`);
    }

    const geminiJson = await geminiRes.json();
    const rawText: string = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(limpiarJson(rawText));

    const usage = geminiJson.usageMetadata ?? {};
    await supabase.from("uso_gemini").insert({
      negocio_id: campana.clientes.negocio_id,
      funcion: "generar_campana",
      modelo: GEMINI_MODEL,
      prompt_tokens: usage.promptTokenCount ?? null,
      candidates_tokens: usage.candidatesTokenCount ?? null,
      total_tokens: usage.totalTokenCount ?? null,
      creditos_cobrados: COSTO_CREDITOS,
    });

    const nuevoContexto = campana.contexto_extra
      ? `${campana.contexto_extra}\n\n[Resumen generado por IA]: ${parsed.resumen}`
      : `[Resumen generado por IA]: ${parsed.resumen}`;

    const { error: updateError } = await supabase
      .from("campanas_cliente")
      .update({
        pilares_semanales: parsed.pilares,
        estado: "activa",
        contexto_extra: nuevoContexto,
      })
      .eq("id", campana_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ pilares: parsed.pilares, resumen: parsed.resumen }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
