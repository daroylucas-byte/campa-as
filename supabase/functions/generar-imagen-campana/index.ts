// Genera la(s) imagen(es) de un post, respetando la identidad visual analizada del cliente.
// Soporta 3 formatos: simple (1 imagen), feed (3), carrusel (5). Para feed/carrusel, primero
// se planifica un guión narrativo (llamada de texto barata) y luego se genera cada imagen en
// secuencia, pasándole su rol específico dentro de la historia + un resumen de las imágenes
// previas para maximizar continuidad visual (misma paleta/estilo/composición base).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";

const CONFIG_FORMATO: Record<string, { cantidad: number; costo: number }> = {
  simple: { cantidad: 1, costo: 1300 },
  feed: { cantidad: 3, costo: 3200 },
  carrusel: { cantidad: 5, costo: 5500 },
};

function limpiarJson(texto: string): string {
  return texto.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
}

interface Escena {
  orden: number;
  rol: string;
  descripcion: string;
}

async function planificarSecuencia(
  cantidad: number,
  post: Record<string, unknown>,
  razonSocial: string,
  identidadTexto: string,
): Promise<Escena[]> {
  const prompt = `
Sos un director de arte de una agencia de marketing. Vas a planificar la secuencia visual de
${cantidad} imágenes para un carrusel/feed de redes sociales de la marca "${razonSocial}".

Identidad visual de la marca (usarla como base real de las escenas, no como decoración):
${identidadTexto}

Contenido del post:
- Hook: ${post.hook ?? ""}
- Copy: ${post.copy ?? ""}
- CTA: ${post.cta ?? ""}

Diseñá un guión de ${cantidad} escenas que cuenten una mini-historia visual coherente (por
ejemplo: portada/gancho → desarrollo → detalle/beneficio → prueba social → cierre con CTA,
adaptalo según la cantidad de escenas pedidas). Cada escena debe describir una situación
CONCRETA y fiel a la identidad de marca de arriba (por ejemplo: una persona real usando o
mostrando el producto, un detalle del producto en contexto, una aplicación práctica de la
marca), NO un patrón gráfico abstracto, textura decorativa, o composición genérica de
formas/manchas de color desconectada de lo que la marca realmente vende o representa. Todas
las escenas deben poder compartir la misma paleta de colores, iluminación y estilo fotográfico
entre sí.

Respondé ÚNICAMENTE con un JSON array válido, sin texto adicional, con esta forma exacta:
[
  { "orden": 1, "rol": "string corto (ej. portada, desarrollo, cierre)", "descripcion": "1-2 oraciones concretas de qué mostrar en esta escena específica, fieles a la identidad de marca" }
]
Debe tener exactamente ${cantidad} elementos.`.trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini error (planificación de secuencia): ${await res.text()}`);
  }

  const json = await res.json();
  const rawText: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return JSON.parse(limpiarJson(rawText)) as Escena[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post_id, usuario_id, sugerencia_usuario, formato = "simple" } = await req.json();
    if (!post_id) {
      return new Response(JSON.stringify({ error: "post_id es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config = CONFIG_FORMATO[formato];
    if (!config) {
      return new Response(
        JSON.stringify({ error: "formato inválido. Debe ser 'simple', 'feed' o 'carrusel'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

    const identidadTexto =
      identidad?.estilo_descripcion ?? "Sin identidad visual definida: usá un estilo profesional y limpio.";

    const formatoVertical = ["story", "reel"].includes(post.tipo_contenido);
    const aspecto = formatoVertical ? "9:16 vertical" : "1:1 cuadrado";

    // Descuento antes de llamar a Gemini (mismo patrón que el resto de las funciones).
    await supabase.rpc("descontar_saldo_marketing", {
      p_negocio_id: cliente.negocio_id,
      p_monto: config.costo,
      p_tipo: "generar_imagen_campana",
      p_descripcion: sugerencia_usuario
        ? `Imagen(es) de post (${formato}) - ${post.campanas_cliente.nombre_campana} (ajuste: ${sugerencia_usuario})`
        : `Imagen(es) de post (${formato}) - ${post.campanas_cliente.nombre_campana}`,
      p_usuario_id: usuario_id ?? null,
    });

    // Paso 1: planificar la secuencia narrativa si son varias imágenes.
    let escenas: Escena[];
    if (config.cantidad === 1) {
      escenas = [{ orden: 1, rol: "único", descripcion: "imagen principal del post" }];
    } else {
      escenas = await planificarSecuencia(config.cantidad, post, cliente.razon_social, identidadTexto);
    }

    // Paso 2: generar cada imagen en secuencia, con contexto de continuidad de las anteriores.
    const urls: string[] = [];
    const resumenAnteriores: string[] = [];
    let tokensTotales = { prompt: 0, candidates: 0, total: 0 };

    for (const escena of escenas) {
      const bloqueSecuencia =
        config.cantidad > 1
          ? `
Esta es la imagen ${escena.orden} de ${config.cantidad} de un ${formato === "carrusel" ? "carrusel" : "feed"}.
Rol de esta escena: ${escena.rol}.
Qué mostrar: ${escena.descripcion}.
Esta descripción de escena es un COMPLEMENTO a la identidad visual de marca de arriba, nunca
un reemplazo — priorizá siempre representar la marca real (producto, persona, contexto de uso)
por sobre composiciones gráficas abstractas o decorativas.
Debe compartir EXACTAMENTE la misma paleta de colores, iluminación y estilo fotográfico/gráfico
que el resto de la secuencia, pero con composición distinta a las anteriores (no repetir el
mismo encuadre).
${resumenAnteriores.length > 0 ? `Imágenes anteriores de esta misma secuencia:\n${resumenAnteriores.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}` : ""}
`.trim()
          : "";

      const prompt = `
REGLAS OBLIGATORIAS DE IDENTIDAD VISUAL (PRIORIDAD #1, deben respetarse estrictamente):
${identidadTexto}

---

Generá una imagen para un post de redes sociales de la marca "${cliente.razon_social}".
Formato: ${aspecto}.
Tipo de contenido: ${post.tipo_contenido}.

${bloqueSecuencia}

---

Contexto general del post (tema/inspiración visual, no texto literal salvo que tenga sentido
incluir texto corto en la imagen):
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

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );

      if (!geminiRes.ok) {
        throw new Error(`Gemini error (imagen ${escena.orden}/${config.cantidad}): ${await geminiRes.text()}`);
      }

      const geminiJson = await geminiRes.json();
      const imagePart = geminiJson.candidates?.[0]?.content?.parts?.find(
        (p: Record<string, unknown>) => p.inlineData,
      );

      if (!imagePart) {
        throw new Error(`Gemini no devolvió una imagen (escena ${escena.orden}/${config.cantidad})`);
      }

      const usage = geminiJson.usageMetadata ?? {};
      tokensTotales.prompt += usage.promptTokenCount ?? 0;
      tokensTotales.candidates += usage.candidatesTokenCount ?? 0;
      tokensTotales.total += usage.totalTokenCount ?? 0;

      const { mimeType, data: base64Data } = imagePart.inlineData;
      const ext = mimeType.split("/")[1] ?? "png";
      const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const path = `campanas/${post_id}-${escena.orden}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("marketing")
        .upload(path, bytes, { contentType: mimeType, upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("marketing").getPublicUrl(path);
      urls.push(publicUrlData.publicUrl);
      resumenAnteriores.push(`(${escena.rol}) ${escena.descripcion}`);
    }

    await supabase.from("uso_gemini").insert({
      negocio_id: cliente.negocio_id,
      funcion: "generar_imagen_campana",
      modelo: GEMINI_IMAGE_MODEL,
      prompt_tokens: tokensTotales.prompt,
      candidates_tokens: tokensTotales.candidates,
      total_tokens: tokensTotales.total,
      creditos_cobrados: config.costo,
    });

    const { error: updateError } = await supabase
      .from("campana_posts")
      .update({
        imagen_url: urls[0],
        imagenes_urls: urls,
        formato_imagen: formato,
      })
      .eq("id", post_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ imagen_url: urls[0], imagenes_urls: urls, formato }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
