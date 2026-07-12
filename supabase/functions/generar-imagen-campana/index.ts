// Genera la imagen de un post puntual, respetando la identidad visual analizada del cliente.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const COSTO_CREDITOS = 1250;
const GEMINI_MODEL = "gemini-3.1-flash-image";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_id, usuario_id, sugerencia_usuario } = await req.json();
    if (!post_id) {
      return new Response(JSON.stringify({ error: "post_id es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: post, error: postError } = await supabase
      .from("campana_posts")
      .select("*, campanas_cliente(id, nombre_campana, cliente_id, clientes(id, negocio_id, razon_social))")
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cliente = post.campanas_cliente.clientes;

    const { data: identidad } = await supabase
      .from("analisis_identidad_cliente")
      .select("estilo_descripcion")
      .eq("cliente_id", cliente.id)
      .maybeSingle();

    const formatoVertical = ["story", "reel"].includes(post.tipo_contenido);
    const aspecto = formatoVertical ? "9:16 vertical" : "1:1 cuadrado";

    // La identidad visual va primero y marcada como prioridad #1: los modelos de imagen
    // priorizan mejor las restricciones de estilo cuando están al principio y delimitadas,
    // no diluidas en un párrafo al final.
    const prompt = `
REGLAS OBLIGATORIAS DE IDENTIDAD VISUAL (PRIORIDAD #1, deben respetarse estrictamente):
${identidad?.estilo_descripcion ?? "Sin identidad visual definida: usá un estilo profesional y limpio."}

---

Generá una imagen para un post de redes sociales de la marca "${cliente.razon_social}".
Formato: ${aspecto}.
Tipo de contenido: ${post.tipo_contenido}.

Contexto del post (usalo como tema/inspiración visual, no como texto literal a menos que
tenga sentido incluir texto corto en la imagen):
- Hook: ${post.hook ?? ""}
- Copy: ${post.copy ?? ""}
- CTA: ${post.cta ?? ""}
- Hashtags: ${(post.hashtags ?? []).join(" ")}

---

REGLAS DE IDIOMA (obligatorias si la imagen incluye texto):
- Cualquier texto en la imagen debe estar en español rioplatense/argentino.
- Usá únicamente el alfabeto español (incluida la "ñ").
- Prohibido usar diacríticos o caracteres de otros idiomas (portugués, francés, etc.).
- El nombre de marca debe reproducirse exactamente como: "${cliente.razon_social}".
${sugerencia_usuario ? `\n---\n\nAJUSTE SOLICITADO POR EL USUARIO (prioridad alta, aplicar sin perder lo anterior):\n${sugerencia_usuario}` : ""}
`.trim();

    await supabase.rpc("descontar_saldo_marketing", {
      p_negocio_id: cliente.negocio_id,
      p_monto: COSTO_CREDITOS,
      p_tipo: "generar_imagen_campana",
      p_descripcion: sugerencia_usuario
        ? `Imagen de post - ${post.campanas_cliente.nombre_campana} (ajuste: ${sugerencia_usuario})`
        : `Imagen de post - ${post.campanas_cliente.nombre_campana}`,
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
    const imagePart = geminiJson.candidates?.[0]?.content?.parts?.find(
      (p: Record<string, unknown>) => p.inlineData,
    );

    if (!imagePart) {
      throw new Error("Gemini no devolvió una imagen");
    }

    const usage = geminiJson.usageMetadata ?? {};
    await supabase.from("uso_gemini").insert({
      negocio_id: cliente.negocio_id,
      funcion: "generar_imagen_campana",
      modelo: GEMINI_MODEL,
      prompt_tokens: usage.promptTokenCount ?? null,
      candidates_tokens: usage.candidatesTokenCount ?? null,
      total_tokens: usage.totalTokenCount ?? null,
      creditos_cobrados: COSTO_CREDITOS,
    });

    const { mimeType, data: base64Data } = imagePart.inlineData;
    const ext = mimeType.split("/")[1] ?? "png";
    const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const path = `campanas/${post_id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("marketing")
      .upload(path, bytes, { contentType: mimeType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("marketing").getPublicUrl(path);
    const imagenUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("campana_posts")
      .update({ imagen_url: imagenUrl })
      .eq("id", post_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ imagen_url: imagenUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
