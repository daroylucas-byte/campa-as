// Analiza hasta 5 imágenes de referencia de un cliente y guarda una descripción de estilo
// (paleta, tipografía, tono, elementos gráficos) reutilizada por todas las campañas del cliente.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const COSTO_CREDITOS = 500;
const GEMINI_MODEL = "gemini-3.1-flash-image";

// String.fromCharCode(...bytes) revienta el call stack con imágenes grandes (el spread
// pasa cada byte como argumento individual, y V8 tiene un límite ~65k args por llamada).
// Convertir en chunks evita el problema sin cargar toda la imagen en un solo array grande.
function arrayBufferABase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 8192;
  let binario = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binario += String.fromCharCode(...chunk);
  }
  return btoa(binario);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cliente_id, usuario_id } = await req.json();
    if (!cliente_id) {
      return new Response(JSON.stringify({ error: "cliente_id es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, negocio_id, razon_social")
      .eq("id", cliente_id)
      .single();

    if (clienteError || !cliente) {
      return new Response(JSON.stringify({ error: "Cliente no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: imagenes, error: imagenesError } = await supabase
      .from("identidad_visual_cliente")
      .select("imagen_url, categoria")
      .eq("cliente_id", cliente_id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (imagenesError || !imagenes || imagenes.length === 0) {
      return new Response(
        JSON.stringify({ error: "El cliente no tiene imágenes de referencia subidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ETIQUETAS_CATEGORIA: Record<string, string> = {
      logo: "Logo de la marca",
      flyer: "Flyer / pieza gráfica previa",
      post: "Post de redes sociales ya publicado",
      foto_producto: "Foto de producto",
      otro: "Imagen de referencia general",
    };

    const parts: Array<Record<string, unknown>> = [];
    for (const img of imagenes) {
      const res = await fetch(img.imagen_url);
      const buffer = await res.arrayBuffer();
      const base64 = arrayBufferABase64(buffer);
      const mimeType = res.headers.get("content-type") ?? "image/png";
      const etiqueta = ETIQUETAS_CATEGORIA[img.categoria] ?? ETIQUETAS_CATEGORIA.otro;
      parts.push({ text: `Imagen de referencia — categoría: ${etiqueta}` });
      parts.push({ inlineData: { mimeType, data: base64 } });
    }

    parts.push({
      text:
        `Analizá estas imágenes de referencia de la marca "${cliente.razon_social}" ` +
        `(cada una identificada por su categoría arriba) y describí en un párrafo de ` +
        `texto plano (sin markdown, sin listas): la paleta de colores predominante (con ` +
        `códigos hex si es posible identificarlos), la tipografía sugerida por el estilo ` +
        `visual, el tono general de la marca (formal, juvenil, premium, etc.) y los ` +
        `elementos gráficos recurrentes (formas, íconos, texturas). Si hay un logo entre ` +
        `las imágenes, priorizá sus colores y formas como la identidad central de la marca, ` +
        `y usá el resto (flyers, posts, fotos de producto) como contexto de cómo se aplica ` +
        `esa identidad en distintas piezas. Respondé en español rioplatense.`,
    });

    await supabase.rpc("descontar_saldo_marketing", {
      p_negocio_id: cliente.negocio_id,
      p_monto: COSTO_CREDITOS,
      p_tipo: "analizar_identidad_cliente",
      p_descripcion: `Análisis de identidad visual - ${cliente.razon_social}`,
      p_usuario_id: usuario_id ?? null,
    });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini error: ${errText}`);
    }

    const geminiJson = await geminiRes.json();
    const estiloDescripcion: string =
      geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    const usage = geminiJson.usageMetadata ?? {};
    await supabase.from("uso_gemini").insert({
      negocio_id: cliente.negocio_id,
      funcion: "analizar_identidad_cliente",
      modelo: GEMINI_MODEL,
      prompt_tokens: usage.promptTokenCount ?? null,
      candidates_tokens: usage.candidatesTokenCount ?? null,
      total_tokens: usage.totalTokenCount ?? null,
      creditos_cobrados: COSTO_CREDITOS,
    });

    const { error: upsertError } = await supabase
      .from("analisis_identidad_cliente")
      .upsert(
        { cliente_id, estilo_descripcion: estiloDescripcion, updated_at: new Date().toISOString() },
        { onConflict: "cliente_id" },
      );

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ estilo_descripcion: estiloDescripcion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
