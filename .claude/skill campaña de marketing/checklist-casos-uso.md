# Checklist y Casos de Uso - Meta Ads Specifications

## 🎯 Checklist Pre-Producción

### Antes de que tu app genere outputs, verifica:

#### ✅ Dimensiones Correctas
- [ ] Feed cuadrado: 1080 x 1080 px exacto
- [ ] Feed vertical: 1080 x 1350 px exacto  
- [ ] Stories/Reels: 1080 x 1920 px exacto
- [ ] Carrusel: 1080 x 1080 px por tarjeta
- [ ] Messenger: 1200 x 1200 px exacto
- [ ] Sin escaling, sin zoom, dimensión exacta

#### ✅ Formatos y Tamaño
- [ ] Imágenes: JPG o PNG (PNG si tiene transparencia)
- [ ] Videos: MP4 o MOV
- [ ] Ninguna imagen supera 30 MB
- [ ] Ningún video supera 4 GB
- [ ] Resolución mínima: 1080 x 1080 px

#### ✅ Copy y Texto
- [ ] Título: máximo 45 caracteres
- [ ] Descripción: máximo 25 caracteres
- [ ] Cuerpo principal: máximo 125 caracteres
- [ ] CTA claro y directo ("Comprar", "Ver Oferta", etc.)
- [ ] Tipografía: grande y legible en móvil (min 24pt)
- [ ] Contraste alto entre texto y fondo

#### ✅ Zona Segura (CRÍTICO para Stories)
- [ ] Texto principal dentro de píxeles 250-1248 (vertical)
- [ ] Producto/héroe image en zona central
- [ ] Ningún elemento importante en top 14% o bottom 35%
- [ ] Probado en vertical 9:16 sin distorsión

#### ✅ URLs y CTA
- [ ] Enlace destino válido (https://)
- [ ] CTA button visible y clickeable
- [ ] No hay redirect chains innecesarias
- [ ] Landing page carga rápido (<3 segundos)
- [ ] Landing page es mobile-responsive

#### ✅ Archivos
- [ ] Nombres de archivo descriptivos (no "img_1.png")
- [ ] Carpeta estructura clara
- [ ] ZIP descargable con todos los creativos
- [ ] README.txt con instrucciones

#### ✅ Validación Visual
- [ ] Previsualizar en móvil (responsivo)
- [ ] Previsualizar en desktop
- [ ] Sin barras negras
- [ ] Sin distorsión o cortes
- [ ] Colores vibrantes (no washed out)
- [ ] Logo/marca clara pero no invasiva

---

## 💼 Casos de Uso por Tipo de Negocio

### Caso 1: E-commerce de Moda

**Input de la app:**
```
Base datos: 500 SKU
Stock: Camisetas 1200 units, Shorts 800 units, Vestidos 500 units
Vendidos últimos 30 días: Camisetas 350, Shorts 200, Vestidos 150
Márgenes: Camisetas 40%, Shorts 45%, Vestidos 50%
Objetivo: Limpiar stock de temporada anterior
```

**Output esperado:**
```
✓ Feed Cuadrado: Hero image camiseta + descuento 50%
✓ Feed Vertical: Modelo vistiendo look completo
✓ Story: Animación de 15 seg (modelo cambiando outfits)
✓ Carrusel: 5 productos top (camiseta, shorts, vestidos, accesorios, combo)
✓ Messenger: Oferta exclusiva "cuéntame en chat"
```

**Metadatos:**
```json
{
  "titulo": "Liquidación de verano -50%",
  "productos_destacados": ["camiseta_hero", "shorts_premium", "vestido_exclusivo"],
  "presupuesto_diario": 100,
  "audiencia": "Mujeres 18-45, Argentina, interés en moda"
}
```

---

### Caso 2: Tienda de Electrónica

**Input:**
```
Productos: Laptops, Tablets, Auriculares, Smartwatches
Stock crítico: Auriculares inalámbricos (200 units en almacén)
Margen: Auriculares 35%
Objetivo: Vender auriculares en promo para liberar espacio
```

**Output esperado:**
```
✓ Feed: Auricular en la oreja + especificaciones técnicas
✓ Story: Unboxing o demostración de 10 segundos
✓ Carrusel: Auricular + accesorios compatibles (funda, cable, adaptador)
✓ Messenger: "Chat con experto para asesoría técnica"
```

**Nota:** El copy debe enfatizar especificaciones técnicas (battery life, conectividad, etc.)

---

### Caso 3: Restaurante/Delivery

**Input:**
```
Dishes: Pizzas, Hamburguesas, Ensaladas, Postres
Baja demanda: Ensaladas saludables (30 pedidos/mes)
Objetivo: Aumentar venta de menú saludable
```

**Output:**
```
✓ Feed Vertical: Foto de ensalada apetitosa, close-up
✓ Story: Video de 5 seg preparando ensalada
✓ Carrusel: Diferentes variantes de ensaladas
✓ CTA: "Ordenar ahora" a app/WhatsApp
```

**Nota:** Imágenes de comida deben ser HIGH QUALITY, bien iluminadas

---

### Caso 4: SaaS/Software

**Input:**
```
Producto: Software de gestión de inventario
Target: Pequeños comercios (1-10 empleados)
Objetivo: Leads para free trial
```

**Output:**
```
✓ Feed: Captura de pantalla de dashboard + "Gestiona +80% más rápido"
✓ Story: Testimonio de usuario de 10 seg
✓ Carrusel: Feature 1, Feature 2, Feature 3, Pricing, CTA
✓ Messenger: "Preguntas sobre el software? Chatea aquí"
```

**Nota:** Copy más profesional, menos emojis

---

## 📝 Ejemplos de Copy por Formato

### Para Feed Cuadrado (1080x1080)

```
TÍTULO (45 char máx):
"Oferta exclusiva: 50% OFF"

DESCRIPCIÓN (25 char máx):
"Solo este mes"

CUERPO (125 char máx):
"Descubre nuestras mejores promociones de verano. Ropa, accesorios y 
más con descuentos increíbles. ¡Compra ahora antes que se agote!"

CTA:
"Comprar Ahora"
```

### Para Story (1080x1920)

```
HEADLINE (45 char):
"¡OFERTA FLASH!"

COPY (80 char):
"50% en toda la tienda. Hoy solamente"

ZONA SEGURA (solo aquí):
- Logo arriba
- Producto en el medio
- CTA grande en botón

DURACIÓN: 5 segundos
```

### Para Carrusel (5 tarjetas de 1080x1080)

```
TARJETA 1 (GANCHO - más atractiva):
Título: "Camisetas en liquidación"
Texto: "Hasta 50% OFF"
CTA: "Ver colección"

TARJETA 2:
Título: "Shorts premium"
Texto: "Comodidad y estilo"
CTA: "Descubrir"

TARJETA 3:
Título: "Vestidos exclusivos"
Texto: "Diseños únicos"
CTA: "Ver más"

TARJETA 4:
Título: "Accesorios"
Texto: "Completa tu look"
CTA: "Explorar"

TARJETA 5 (CIERRE):
Título: "Combo completo"
Texto: "Hasta 60% menos"
CTA: "Comprar combo"
```

---

## 🎨 Guía de Colores para Diferentes Industrias

### E-commerce de Moda
- Colores: Blanco, negro, dorado (elegant)
- Contraste: Alto
- Estilo: Clean, minimalista

### Alimentos/Restaurante
- Colores: Reds, oranges, greens (apetitosos)
- Contraste: Medio-Alto
- Estilo: Vibrant, delicioso

### Tech/SaaS
- Colores: Blues, grays, accent colors
- Contraste: Alto
- Estilo: Clean, professional

### Salud/Wellness
- Colores: Greens, pastels, whites
- Contraste: Medio
- Estilo: Calm, serene

---

## 📊 Tamaños de Archivo Esperados

```
RECOMENDADO POR TIPO:

Feed Cuadrado 1080x1080:
- PNG: 150-400 KB
- JPG: 80-200 KB
(Máximo: 30 MB, pero buena práctica: <500 KB)

Feed Vertical 1080x1350:
- PNG: 180-500 KB
- JPG: 100-250 KB

Story 1080x1920:
- PNG: 250-600 KB
- JPG: 150-350 KB

Video Reel 10 seg:
- MP4: 2-5 MB
- MOV: 3-8 MB

Carrusel por tarjeta:
- Similar a Feed Cuadrado

Messenger 1200x1200:
- PNG: 200-500 KB
- JPG: 120-280 KB

TOTAL ZIP (10 creativos):
~10-50 MB (depende de calidad)
```

---

## 🚀 Flujo de Generación Automatizado (Pseudocódigo)

```python
def generar_campana_promocion(
    productos_lista: List,
    base_datos: Database,
    presupuesto: Float
) -> CampanaMetaJSON:
    
    # 1. ANALIZAR
    mejor_margen = analizar_margenes(productos_lista)
    stock_critico = encontrar_stock_bajo(base_datos)
    productos_prioridad = mejor_margen + stock_critico
    
    # 2. GENERAR COPY
    titulos = generar_titulos_atractivos(productos_prioridad)
    descripciones = generar_descripciones(productos_prioridad)
    
    # 3. CREAR CREATIVOS
    feed_cuadrado = generar_imagen(1080, 1080, "feed")
    feed_vertical = generar_imagen(1080, 1350, "feed_vertical")
    story = generar_imagen(1080, 1920, "story")
    carrusel = generar_carrusel(productos_prioridad[:8], 1080, 1080)
    messenger = generar_imagen(1200, 1200, "messenger")
    
    # 4. VALIDAR
    validar_dimensiones([feed_cuadrado, feed_vertical, story, carrusel])
    validar_copy(titulos, descripciones)
    validar_zona_segura(story)
    
    # 5. ESTRUCTURAR
    campana = {
        "metadata": crear_metadata(presupuesto),
        "creativos": [feed_cuadrado, feed_vertical, story, carrusel, messenger],
        "validacion": check_all_ok(),
        "instrucciones": generar_instrucciones()
    }
    
    # 6. EXPORTAR
    exportar_zip(campana, "campana_promocion.zip")
    
    return campana
```

---

## ❌ Errores Frecuentes (Y cómo evitarlos)

| Error | ¿Por qué sucede? | Solución |
|-------|------------------|----------|
| Imagen recortada | Subir 1080x1900 en lugar de 1080x1920 | Usar exact resolution, validar en código |
| Texto ilegible | Letra pequeña (< 20pt) | Mínimo 24pt, max en zona segura |
| Bajo CTR | CTA no visible o confuso | Botón grande, colores contrastantes |
| Barras negras | Ratio incorrecto (1080x1900 instead of 1920) | Strict pixel dimensions |
| Bajo engagement | Zona segura no respetada, héroe invisible | Mantener dentro de 250-1248px |
| Rechazo de Meta | Imagen con texto >20% del canvas | Meta eliminó la regla pero mejor mantenerla al min |

