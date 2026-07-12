// Genera 5-7 posts para una semana puntual de una campaña, bajo demanda (no las 4 juntas).
// Requiere que la campaña ya tenga pilares_semanales (ver generar-campana).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const COSTO_CREDITOS = 600;
const GEMINI_MODEL = "gemini-2.5-flash";

function limpiarJson(texto: string): string {
  return texto.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campana_id, semana, usuario_id } = await req.json();
    if (!campana_id || !semana || semana < 1 || semana > 4) {
      return new Response(
        JSON.stringify({ error: "campana_id y semana (1-4) son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

    const pilares = (campana.pilares_semanales ?? []) as Array<
      { semana: number; eje: string; enfoque: string }
    >;
    const pilar = pilares.find((p) => p.semana === semana);

    if (!pilar) {
      return new Response(
        JSON.stringify({
          error: "La campaña todavía no tiene un plan generado. Generá el plan de campaña primero.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { count: postsExistentes } = await supabase
      .from("campana_posts")
      .select("id", { count: "exact", head: true })
      .eq("campana_id", campana_id)
      .eq("semana", semana);

    if (postsExistentes && postsExistentes > 0) {
      return new Response(
        JSON.stringify({
          error: "Esta semana ya tiene posts generados. Borralos primero si querés regenerarlos.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
Sos un estratega de contenido de una agencia de marketing. Generá el contenido detallado de
la Semana ${semana} de la campaña "${campana.nombre_campana}" para el cliente
"${campana.clientes.razon_social}".

Eje temático de esta semana: ${pilar.eje}
Enfoque de esta semana: ${pilar.enfoque}
Plataformas de la campaña: ${(campana.plataformas ?? []).join(", ") || "no especificadas"}
Público objetivo: ${campana.publico_objetivo ?? "no especificado"}
Contexto adicional de la campaña: ${campana.contexto_extra ?? "ninguno"}
${contextoIdentidad}

Generá entre 5 y 7 posts distribuidos en la semana, variando plataforma y tipo de contenido
donde tenga sentido. Respondé ÚNICAMENTE con un JSON array válido, sin texto adicional, con
esta forma exacta por cada post:
{
  "dia": "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo",
  "plataforma": "Instagram" | "Facebook" | "TikTok" | "LinkedIn" | "Twitter/X" | "YouTube",
  "tipo_contenido": "carousel" | "reel" | "video" | "imagen" | "story",
  "hora_sugerida": "HH:MM",
  "hook": "frase de apertura que capta atención",
  "copy": "el texto completo del post",
  "cta": "llamado a la acción",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "objetivo_post": "awareness" | "engagement" | "conversion" | "retencion"
}`.trim();

    await supabase.rpc("descontar_saldo_marketing", {
      p_negocio_id: campana.clientes.negocio_id,
      p_monto: COSTO_CREDITOS,
      p_tipo: "generar_semana_campana",
      p_descripcion: `Posts semana ${semana} - ${campana.nombre_campana}`,
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
    const posts = JSON.parse(limpiarJson(rawText)) as Array<Record<string, unknown>>;

    const usage = geminiJson.usageMetadata ?? {};
    await supabase.from("uso_gemini").insert({
      negocio_id: campana.clientes.negocio_id,
      funcion: "generar_semana_campana",
      modelo: GEMINI_MODEL,
      prompt_tokens: usage.promptTokenCount ?? null,
      candidates_tokens: usage.candidatesTokenCount ?? null,
      total_tokens: usage.totalTokenCount ?? null,
      creditos_cobrados: COSTO_CREDITOS,
    });

    const filas = posts.map((p) => ({
      campana_id,
      semana,
      fecha: null,
      plataforma: p.plataforma,
      tipo_contenido: p.tipo_contenido,
      hora_sugerida: p.hora_sugerida,
      hook: p.hook,
      copy: p.dia ? `[${p.dia}] ${p.copy}` : p.copy,
      cta: p.cta,
      hashtags: p.hashtags ?? [],
      objetivo_post: p.objetivo_post,
      estado: "pendiente",
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("campana_posts")
      .insert(filas)
      .select();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ posts: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
