---
name: meta-ad-specifications
description: Guía completa de especificaciones técnicas para crear anuncios compatibles con Meta/Facebook. Use esta skill cuando necesite generar creativos publicitarios (flyers, imágenes, carruseles), validar dimensiones de anuncios, estructurar metadatos de campañas, crear outputs automáticos para Ads Manager, definir especificaciones de imagen/video para Facebook/Instagram, o diseñar estrategias de contenido con requisitos técnicos precisos. Aplique esta skill para asegurar que todos los creativos se adapten perfectamente a las ubicaciones de Meta sin recortes, distorsión o pérdida de calidad.
---

# Especificaciones Técnicas de Meta/Facebook Ads

Una guía práctica para generar creativos publicitarios que cumplan con todos los requisitos técnicos de Meta. Esta skill te ayuda a entender qué necesita Meta para que tus anuncios se vean perfectos en todas las plataformas.

## 🎯 Cuándo usar esta skill

- Generando creativo automático para campañas de promociones
- Configurando dimensiones correctas para flyers y banners
- Creando carruseles de productos
- Estructurando metadatos para importar a Ads Manager
- Validando outputs antes de pasar a producción
- Diseñando el flujo de una app que genere publicidades

---

## 📐 Dimensiones Principales por Formato

### 1. **Feed de Noticias (El más importante - 80% del tráfico)**

| Variante | Dimensión | Relación | Mejor Para | Notas |
|----------|-----------|----------|-----------|-------|
| Cuadrado | 1080 x 1080 px | 1:1 | Versátil, funciona en todos lados | Estándar más segura |
| Vertical (Recomendado) | 1080 x 1350 px | 4:5 | Máximo impacto en móvil | Ocupa más espacio, mejor engagement |
| Horizontal | 1200 x 628 px | 1.91:1 | Links y ofertas | Menos usado pero efectivo |

**Dónde aparece:** Feed principal de Facebook e Instagram, página de exploración

---

### 2. **Stories & Reels (Formato Vertical - En crecimiento)**

**Dimensión:** 1080 x 1920 px | **Relación:** 9:16 (pantalla completa)

**ZONA SEGURA CRÍTICA:**
- ⚠️ **14% superior** (250 px): Cubierto por icono de perfil + nombre
- ⚠️ **35% inferior** (672 px): Cubierto por botones CTA y leyendas
- ✅ **51% central** (píxeles 250-1248): **VISIBLE GARANTIZADO**

**Ubicación de elementos críticos:** Todos los textos principales, fotos de productos, y CTA deben estar en la zona central para garantizar visibilidad.

**Duración recomendada:**
- Imagen estática: 5 segundos (automático)
- Video: 10-15 segundos máximo (ideal para engagement)

---

### 3. **Carrusel (2-10 tarjetas)**

**Dimensión por tarjeta:** 1080 x 1080 px | **Relación:** 1:1

**Especificaciones:**
- Mínimo: 2 tarjetas
- Máximo: 10 tarjetas
- **Consejo:** Coloca el producto/promoción más atractivo en la PRIMERA tarjeta (es el "gancho")

**Metadatos por tarjeta:**
- Título: 45 caracteres
- Texto principal: 80 caracteres
- Descripción: 18 caracteres
- Enlace propio: Sí (cada tarjeta puede llevar a URL diferente)

---

### 4. **Messenger**

**Dimensión:** 1200 x 1200 px | **Relación:** 1:1

**Ventaja:** Menos competencia, usuarios con alta intención de compra

---

### 5. **Marketplace**

**Dimensión:** 1080 x 1080 px | **Relación:** 1:1

**Nota:** Muestra el precio del producto cuando sea posible

---

### 6. **Audience Network (Apps terceros)**

**Dimensión mínima:** 398 x 208 px  
**Recomendado:** 1080 x 1080 px

---

## 📄 Especificaciones Técnicas Generales

### Formatos de archivo
```
IMÁGENES:
- JPG o PNG
- Máximo: 30 MB por imagen
- Mínimo recomendado: 1080 x 1080 px

VIDEOS:
- MP4 o MOV
- Máximo: 4 GB
- Compresión: H.264, square pixels, frame rate fijo
- Audio: AAC stereo 128kbps+
- Duración: hasta 240 minutos (pero optimizar para <15 seg en Stories)
```

### Límites de texto en imagen
- **Penalización:** NO hay (Meta eliminó la regla del 20%)
- **Recomendación:** Mantener texto mínimo para mejor rendimiento
- **Legibilidad:** Tipografía grande, alto contraste, pensada para móvil

---

## 🏗️ Estructura de Metadatos (Para Automatización)

Cuando tu app genere publicidades, cada pieza debe incluir estos metadatos:

```json
{
  "campaign_metadata": {
    "titulo_anuncio": "Oferta exclusiva (40-45 caracteres máx)",
    "descripcion": "Resumen corto de la promoción (25 caracteres máx)",
    "cuerpo_principal": "Descripción completa de la oferta (80-125 caracteres)",
    "cta_boton": "Comprar Ahora",
    "enlace_destino": "https://tienda.com/producto",
    "presupuesto_sugerido": 50
  },
  "creativos": {
    "feed_cuadrado": {
      "ruta_archivo": "feed_1080x1080.png",
      "dimension": "1080x1080",
      "relacion": "1:1",
      "formato": "PNG"
    },
    "feed_vertical": {
      "ruta_archivo": "feed_1080x1350.png",
      "dimension": "1080x1350",
      "relacion": "4:5",
      "formato": "PNG"
    },
    "story": {
      "ruta_archivo": "story_1080x1920.png",
      "dimension": "1080x1920",
      "relacion": "9:16",
      "zona_segura": "píxeles 250-1248 en altura"
    },
    "carrusel": [
      {
        "tarjeta_numero": 1,
        "ruta_archivo": "carrusel_01_1080x1080.png",
        "es_gancho": true,
        "titulo": "Oferta destacada (45 car)",
        "texto": "Descripción corta (80 car)",
        "enlace": "https://tienda.com/producto-1"
      }
    ]
  }
}
```

---

## ✅ Checklist de Validación

Antes de pasar un creativo a producción, verifica:

- [ ] **Dimensión correcta** para el formato (sin letras negras, sin distorsión)
- [ ] **Tamaño de archivo** dentro del límite (30 MB imágenes, 4 GB videos)
- [ ] **Formato:** JPG/PNG para imágenes, MP4/MOV para videos
- [ ] **Zona segura:** Elementos críticos dentro de la zona visible (Stories)
- [ ] **Textos:** Títulos y descripciones respetan caracteres límite
- [ ] **Legibilidad en móvil:** Fuentes grandes, contraste alto
- [ ] **CTA visible:** Botón de llamada a acción claro y clickeable
- [ ] **Sin marca acuosa:** Bordes limpios, sin watermarks visibles
- [ ] **URLs correctas:** Enlaces apuntan al destino correcto

---

## 🚀 Flujo Recomendado para Apps de Generación Automática

### INPUT
```
Base de datos: Ventas + Stock + Márgenes + Datos de productos
```

### PROCESAMIENTO
```
1. IA analiza mejor performance
2. Identifica top 5-8 productos para promocionar
3. Calcula descuentos óptimos
4. Genera copy persuasivo
```

### OUTPUT (Carpeta ZIP estructurada)
```
campana_promocion_[fecha]/
├── feed/
│   ├── feed_cuadrado_1080x1080.png
│   └── feed_vertical_1080x1350.png
├── stories/
│   ├── story_1080x1920_v1.png
│   └── story_1080x1920_v2.png
├── carousel/
│   ├── carousel_tarjeta_01_1080x1080.png
│   ├── carousel_tarjeta_02_1080x1080.png
│   └── ... (máximo 10)
├── messenger/
│   └── messenger_1200x1200.png
├── especificaciones.json
└── README.txt
```

---

## 📊 Cantidad de Creativos Recomendada

### Campaña Mínima (POC)
- 1 anuncio Feed (cuadrado o vertical)
- 1 Story/Reel
- Total: 2 creativos, 1 variante de copy

### Campaña Estándar (Recomendado)
- 2-3 variantes de Feed (cuadrado + vertical)
- 2-3 Stories/Reels
- 1 Carrusel (5-8 tarjetas)
- 1 Messenger
- **Subtotal: 5 creativos diferentes**

### Campaña Completa (A/B Testing)
- 3 variantes de Feed con copy diferente
- 3 Stories/Reels con ángulos creativos distintos
- 2 Carruseles (uno por segmento de audience)
- 2 Messenger
- **Subtotal: 10+ creativos**

**Recomendación:** A mayor cantidad de variantes = mejor A/B testing = mejor ROI

---

## 🎨 Mejores Prácticas de Diseño

### Para Feed
- Usa el 51% superior/inferior para elementos secundarios
- Coloca el producto/hero image en el centro
- Fondo limpio sin demasiadas capas
- CTA visible pero no invasivo

### Para Stories/Reels
- Mantén zona segura central (píxeles 250-1248 en Y)
- Movimento visual en primeros 2 segundos (critical!)
- Texto grande y legible desde 3 metros
- Video: 10-15 segundos, sin esperas estáticas

### Para Carruseles
- Primera tarjeta es el gancho (usa oferta más atractiva)
- Consistencia visual entre tarjetas
- CTA claro en cada tarjeta
- Cada tarjeta debe ser independiente pero parte de una historia

---

## 📱 Responsive Design

Meta permite subir múltiples dimensiones para una sola campaña. Tu app debería generar:

```
3 MÍNIMO = Cobertura del 90% de ubicaciones
├─ 1080 x 1080 (Feed + Marketplace)
├─ 1080 x 1350 (Feed vertical)
└─ 1080 x 1920 (Stories/Reels)
```

---

## 🔧 Integración con Ads Manager

### Opción 1: Importación Manual
Descargar ZIP con todos los creativos → Abrir Ads Manager → Seleccionar ubicaciones → Importar imágenes

### Opción 2: API (Si tu app es profesional)
```
Tu app → JSON con especificaciones → 
Meta Marketing API → Campañas creadas automáticamente
```

### Opción 3: CSV para Bulk Upload
Meta aceptar CSVs con URLs de imágenes + metadatos para crear campañas en lote

---

## ⚠️ Errores Comunes y Cómo Evitarlos

| Error | Causa | Solución |
|-------|-------|----------|
| Imagen recortada | Dimensión incorrecta | Usar exact size, no escalar |
| Barras negras en Stories | Ratio incorrecto | Strict 1080x1920, no 1080x1900 |
| Texto ilegible | Letra pequeña | Min 24pt, max en zona segura |
| Bajo engagement | Zona segura no respetada | Mantener héroe en 250-1248px |
| CTA invisible | Colores sin contraste | Alto contraste sobre fondo |

---

## 📚 Referencias Oficiales

- Meta Business Help: Recommended pixel dimensions
- Meta Ads Manager: Design specifications
- Meta for Developers: Open Graph tags (1200 x 630 px para previsualizaciones)

---

## 🎯 Resumen en Una Frase

**Genera al menos 3 tamaños (Feed cuadrado, Feed vertical, Story) con metadatos JSON estructurados, respeta las zonas seguras en Stories, y valida antes de producción.**

