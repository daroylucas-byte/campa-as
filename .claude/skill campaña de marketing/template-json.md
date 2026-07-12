# Template JSON para Generación Automática de Campañas Meta

Este archivo muestra la estructura JSON que tu app debería generar para cada campaña de promociones.

## Estructura Completa de Campaña

```json
{
  "version": "1.0",
  "metadata": {
    "id_campana": "promo_20260628_verano",
    "nombre_campana": "Promoción de Verano - Julio 2026",
    "fecha_creacion": "2026-06-28",
    "fecha_publicacion_recomendada": "2026-07-01",
    "duracion_dias": 30,
    "presupuesto_diario_sugerido": 50,
    "moneda": "ARS",
    "mercado": "Argentina"
  },
  
  "segmento_audiencia": {
    "edad_minima": 18,
    "edad_maxima": 65,
    "genero": "todos",
    "ubicacion": "Argentina",
    "intereses": ["compras online", "moda", "promociones"],
    "comportamiento_compra": "high-intent"
  },

  "campana": {
    "objetivo": "Tráfico al sitio web",
    "ubicaciones": [
      "feed_instagram",
      "feed_facebook", 
      "instagram_stories",
      "facebook_stories",
      "reels"
    ],
    "cta_principal": "Comprar Ahora"
  },

  "creativos": [
    {
      "id": "creativo_feed_cuadrado_01",
      "tipo": "imagen_estatica",
      "ubicacion": "feed",
      "variante": "cuadrado",
      "especificaciones": {
        "dimension": "1080x1080",
        "relacion_aspecto": "1:1",
        "formato_archivo": "PNG",
        "tamaño_maximo_mb": 30,
        "zona_segura": "full canvas"
      },
      "copy": {
        "titulo": "Verano con estilo (máx 45 caracteres aqui)",
        "descripcion": "Los mejores precios (máx 25 char)",
        "cuerpo_principal": "Descubre nuestras colecciones de moda para el verano. Hasta 50% de descuento en items seleccionados. No te lo pierdas! (máx 125 char)",
        "cta": "Comprar Ahora"
      },
      "url_destino": "https://tienda.com/coleccion/verano",
      "ruta_archivo_generada": "creativos/feed_cuadrado_01_1080x1080.png",
      "hash_validacion": "abc123def456"
    },

    {
      "id": "creativo_feed_vertical_01",
      "tipo": "imagen_estatica",
      "ubicacion": "feed",
      "variante": "vertical",
      "especificaciones": {
        "dimension": "1080x1350",
        "relacion_aspecto": "4:5",
        "formato_archivo": "PNG",
        "tamaño_maximo_mb": 30,
        "zona_segura": "full canvas",
        "nota": "Ocupa más espacio en móvil, mejor engagement"
      },
      "copy": {
        "titulo": "Oferta exclusiva de verano (máx 45 ch)",
        "descripcion": "Ahora con envío gratis (máx 25 ch)",
        "cuerpo_principal": "Grandes descuentos en la colección de verano. Camisetas, shorts, vestidos y más. Válido por tiempo limitado. (máx 125 char)",
        "cta": "Ver Oferta"
      },
      "url_destino": "https://tienda.com/coleccion/verano",
      "ruta_archivo_generada": "creativos/feed_vertical_01_1080x1350.png",
      "hash_validacion": "def456ghi789"
    },

    {
      "id": "creativo_story_01",
      "tipo": "imagen_estatica",
      "ubicacion": "stories_reels",
      "especificaciones": {
        "dimension": "1080x1920",
        "relacion_aspecto": "9:16",
        "formato_archivo": "PNG",
        "tamaño_maximo_mb": 30,
        "duracion_segundos": 5,
        "zona_segura": {
          "superior_cubierto_px": 250,
          "inferior_cubierto_px": 672,
          "rango_visible": "250-1248",
          "recomendacion": "Mantener héroe image y texto principal dentro de este rango"
        },
        "nota": "Formato pantalla completa vertical. Crítico: respetar zona segura para que texto y producto sean visibles"
      },
      "copy": {
        "titulo": "OFERTA LIMITADA (máx 45 ch)",
        "subtitulo": "Solo esta semana (máx 25 ch)",
        "cuerpo_principal": "Hasta 50% OFF en ropa de verano. Compra hoy! (máx 80 ch)",
        "cta": "Comprar Ahora"
      },
      "url_destino": "https://tienda.com/coleccion/verano?utm_source=story",
      "ruta_archivo_generada": "creativos/story_01_1080x1920.png",
      "hash_validacion": "ghi789jkl012"
    },

    {
      "id": "creativo_carrusel_01",
      "tipo": "carrusel",
      "ubicacion": "feed",
      "especificaciones": {
        "cantidad_tarjetas": 5,
        "rango_minimo": 2,
        "rango_maximo": 10,
        "dimension_por_tarjeta": "1080x1080",
        "relacion_aspecto": "1:1",
        "formato_archivo": "PNG",
        "nota": "Cada tarjeta es independiente pero parte de una historia"
      },
      "tarjetas": [
        {
          "numero": 1,
          "es_gancho": true,
          "nombre_producto": "Colección Hero - Camisetas",
          "especificaciones": {
            "dimension": "1080x1080",
            "relacion": "1:1",
            "titulo": "50% OFF - Camisetas (45 ch máx)",
            "texto_principal": "Colores de verano (80 ch máx)",
            "descripcion": "Envío gratis (18 ch máx)"
          },
          "copy": {
            "titulo": "Camisetas exclusivas (máx 45)",
            "texto": "Hasta 50% en todos los estilos (máx 80)",
            "descripcion": "Compra hoy (máx 18)"
          },
          "url_destino": "https://tienda.com/coleccion/camisetas",
          "ruta_archivo": "creativos/carrusel_01_tarjeta_01_1080x1080.png",
          "nota": "Primera tarjeta: gancho más atractivo. Los usuarios ven esto primero antes de deslizar"
        },
        {
          "numero": 2,
          "es_gancho": false,
          "nombre_producto": "Shorts de Verano",
          "copy": {
            "titulo": "Shorts premium (máx 45)",
            "texto": "Cómodos y frescos (máx 80)",
            "descripcion": "Hoy -40% (máx 18)"
          },
          "url_destino": "https://tienda.com/coleccion/shorts",
          "ruta_archivo": "creativos/carrusel_01_tarjeta_02_1080x1080.png"
        },
        {
          "numero": 3,
          "es_gancho": false,
          "nombre_producto": "Vestidos Verano",
          "copy": {
            "titulo": "Vestidos de moda (máx 45)",
            "texto": "Diseños exclusivos (máx 80)",
            "descripcion": "40% OFF (máx 18)"
          },
          "url_destino": "https://tienda.com/coleccion/vestidos",
          "ruta_archivo": "creativos/carrusel_01_tarjeta_03_1080x1080.png"
        },
        {
          "numero": 4,
          "es_gancho": false,
          "nombre_producto": "Accesorios",
          "copy": {
            "titulo": "Accesorios de verano (máx 45)",
            "texto": "Gafas, sombreros, cintos (máx 80)",
            "descripcion": "30% OFF (máx 18)"
          },
          "url_destino": "https://tienda.com/coleccion/accesorios",
          "ruta_archivo": "creativos/carrusel_01_tarjeta_04_1080x1080.png"
        },
        {
          "numero": 5,
          "es_gancho": false,
          "nombre_producto": "Combo Verano",
          "copy": {
            "titulo": "Combo todo el look (máx 45)",
            "texto": "Completa tu estilo de verano (máx 80)",
            "descripcion": "Hasta 50% (máx 18)"
          },
          "url_destino": "https://tienda.com/coleccion/combos",
          "ruta_archivo": "creativos/carrusel_01_tarjeta_05_1080x1080.png"
        }
      ]
    },

    {
      "id": "creativo_messenger_01",
      "tipo": "imagen_estatica",
      "ubicacion": "messenger",
      "especificaciones": {
        "dimension": "1200x1200",
        "relacion_aspecto": "1:1",
        "formato_archivo": "PNG",
        "tamaño_maximo_mb": 30,
        "ventaja": "Menos competencia, usuarios high-intent"
      },
      "copy": {
        "titulo": "Chat exclusivo (máx 45 ch)",
        "texto": "Descuentos solo aquí (máx 80 ch)",
        "cta": "Ver Ofertas"
      },
      "url_destino": "https://tienda.com/landing-messenger",
      "ruta_archivo_generada": "creativos/messenger_01_1200x1200.png"
    }
  ],

  "validacion": {
    "todas_dimensiones_correctas": true,
    "todos_archivos_bajo_30mb": true,
    "textos_dentro_limite_caracteres": true,
    "zona_segura_stories_respetada": true,
    "cta_visible_en_todos": true,
    "urls_validas": true,
    "formatos_archivo_validos": true,
    "estado": "LISTO_PARA_PRODUCCION"
  },

  "estadisticas_generadas": {
    "cantidad_creativos_totales": 6,
    "cantidad_imagenes": 12,
    "cantidad_formatos_diferentes": 4,
    "cobertura_ubicaciones_meta": "90%",
    "tamaño_total_zip_mb": 45
  },

  "instrucciones_importacion": {
    "plataforma": "Meta Ads Manager",
    "pasos": [
      "1. Descargar ZIP con todos los creativos",
      "2. Abrir Meta Ads Manager > Crear Campaña",
      "3. Seleccionar objetivo: Tráfico",
      "4. En sección Creativos: Subir todas las imágenes",
      "5. Seleccionar ubicaciones: Feed + Stories + Reels",
      "6. Pegar URLs de destino de cada creativo",
      "7. Configurar presupuesto y cronograma",
      "8. Revisar preview en móvil y desktop",
      "9. Publicar campaña"
    ]
  }
}
```

## Ejemplo Mínimo (MVP)

Si tu app es básica, genera al menos esto:

```json
{
  "id_campana": "promo_001",
  "creativos": [
    {
      "tipo": "feed_cuadrado",
      "archivo": "feed_1080x1080.png",
      "titulo": "Oferta especial",
      "enlace": "https://tienda.com"
    },
    {
      "tipo": "story",
      "archivo": "story_1080x1920.png",
      "titulo": "Compra ahora",
      "enlace": "https://tienda.com"
    }
  ]
}
```

## Validación en Código

Si tu app es en Python:

```python
# Validar dimensiones
DIMENSION_VALIDA = {
    "feed_cuadrado": (1080, 1080),
    "feed_vertical": (1080, 1350),
    "story": (1080, 1920),
    "carrusel": (1080, 1080),
    "messenger": (1200, 1200)
}

def validar_imagen(ruta_archivo, tipo_formato):
    img = Image.open(ruta_archivo)
    esperada = DIMENSION_VALIDA[tipo_formato]
    
    if img.size != esperada:
        raise ValueError(
            f"Dimensión incorrecta. "
            f"Esperada: {esperada}, Obtenida: {img.size}"
        )
    
    if img.size[0] * img.size[1] * 4 / 1024 / 1024 > 30:  # ~30MB
        raise ValueError("Archivo supera 30MB")
    
    return True

# Validar copy
def validar_copy(titulo, descripcion, cuerpo):
    if len(titulo) > 45:
        raise ValueError(f"Título: {len(titulo)} > 45 caracteres")
    if len(descripcion) > 25:
        raise ValueError(f"Descripción: {len(descripcion)} > 25 caracteres")
    if len(cuerpo) > 125:
        raise ValueError(f"Cuerpo: {len(cuerpo)} > 125 caracteres")
    return True
```

