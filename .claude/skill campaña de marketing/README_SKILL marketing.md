# 🎯 Skill: Meta Ad Specifications

## ¿Qué es esta skill?

Una guía completa y estructurada sobre **cómo generar creativos publicitarios compatibles con Meta/Facebook** que se adapten perfectamente a todas las ubicaciones sin recortes, distorsión o pérdida de calidad.

La skill es ideal para:
- **Desarrolladores** creando apps que generan publicidades automáticamente
- **Equipos de marketing** que necesitan especificaciones técnicas precisas
- **Generadores de contenido AI** que requieren validar outputs para Meta
- **Agencias** que crean campañas en bulk

---

## 📁 Estructura de la Skill

```
meta-ad-specifications/
├── SKILL.md                          # Archivo principal (lo más importante)
│   ├── Frontmatter (name, description)
│   ├── Dimensiones por formato
│   ├── Especificaciones técnicas
│   ├── Metadatos JSON
│   ├── Checklist de validación
│   └── Mejores prácticas
│
└── references/                       # Archivos de referencia adicionales
    ├── template-json.md             # Templates completos JSON para campañas
    └── checklist-casos-uso.md       # Checklist y ejemplos prácticos
```

---

## 🚀 Cómo Usar la Skill

### En Claude.ai

1. **Instalar:** Copia la carpeta `meta-ad-specifications` a tus skills locales
2. **Trigger automático:** Cuando preguntes sobre dimensiones de Meta, especificaciones, o cómo generar creativos publicitarios, Claude automáticamente consultará esta skill
3. **Uso manual:** Puedes decir "Necesito ayuda para generar anuncios Meta" y Claude usará la skill

### Ejemplos de Prompts que Activan la Skill

- "¿Cuáles son las dimensiones correctas para un anuncio de carrusel en Meta?"
- "Genera especificaciones de imagen para una campaña de promociones"
- "¿Qué debe incluir un JSON de metadatos para Meta Ads Manager?"
- "Necesito validar que mis creativos cumplen con Meta antes de subirlos"
- "Mi app va a generar publicidades automáticas para clientes, ¿qué output debería generar?"
- "¿Cuál es la zona segura para Stories en Meta?"
- "Necesito un checklist para validar anuncios antes de producción"

---

## 📊 Contenido Principal

### SKILL.md Incluye:

✅ **Dimensiones Principales por Formato**
- Feed cuadrado (1080x1080)
- Feed vertical (1080x1350)
- Stories/Reels (1080x1920 con zona segura)
- Carruseles (2-10 tarjetas)
- Messenger (1200x1200)
- Marketplace
- Audience Network

✅ **Especificaciones Técnicas**
- Formatos de archivo (JPG, PNG, MP4, MOV)
- Límites de tamaño (30 MB imágenes, 4 GB videos)
- Resoluciones mínimas
- Límites de texto (títulos, descripciones, cuerpo)

✅ **Estructura JSON para Metadatos**
- Template completo con todos los campos
- Ejemplo de estructura para automatización
- Integración con APIs

✅ **Checklist de Validación**
- Antes de producción
- Errores comunes y cómo evitarlos
- Mejores prácticas de diseño

---

## 💡 Caso de Uso Práctico

### Tu App de Promociones

```
INPUT: Base de datos de ventas + stock
↓
PROCESAMIENTO: IA analiza mejores productos
↓
GENERACIÓN: App genera automáticamente:
  - feed_1080x1080.png
  - feed_1080x1350.png
  - story_1080x1920.png
  - carrusel_5_tarjetas_1080x1080.png
  - messenger_1200x1200.png
  - especificaciones.json
  - metadatos.json
↓
VALIDACIÓN: Checklist de SKILL.md
↓
OUTPUT: ZIP listo para Meta Ads Manager
```

---

## 🎯 Qué Puedes Hacer con Esta Skill

### 1. Generar Especificaciones de Imagen
```
"Necesito un JSON con las especificaciones de imagen para 
crear anuncios de carrusel en Meta"
```
↓ La skill te dará estructura exacta

### 2. Validar Creativos
```
"¿Este creativo de 1080x1350 cumple con Meta? 
¿Está en la zona segura?"
```
↓ La skill validará contra checklist oficial

### 3. Estructurar Campañas
```
"¿Cuántos creativos debo generar para una campaña?
¿Qué estructura debería tener el JSON?"
```
↓ La skill te dará template completo

### 4. Troubleshooting
```
"Mi imagen aparece recortada en Stories, ¿por qué?"
```
↓ La skill identificará el problema (zona segura, dimensión, etc.)

---

## 📈 Ejemplos de Salida

### Ejemplo 1: Respuesta sobre Dimensiones
```
Para un anuncio de feed vertical que ocupe más espacio en móvil:
- Dimensión: 1080 x 1350 px
- Relación: 4:5
- Tamaño máximo: 30 MB
- Formato: PNG o JPG
- Mejor para: Máximo engagement en feed móvil
```

### Ejemplo 2: Template de Campaña
```json
{
  "id_campana": "promo_20260628",
  "creativos": [
    {"tipo": "feed_vertical", "archivo": "1080x1350.png"},
    {"tipo": "story", "archivo": "1080x1920.png"},
    {"tipo": "carrusel", "tarjetas": 5}
  ],
  "validacion": "LISTO_PARA_PRODUCCION"
}
```

### Ejemplo 3: Checklist Personalizado
```
✓ Dimensión correcta (1080x1080)
✓ Tamaño archivo bajo 30MB
✓ Texto dentro de límite
✓ Zona segura respetada
✓ CTA visible
✓ URLs válidas
→ APROBADO PARA PUBLICAR
```

---

## 🔧 Integración Técnica

Si tu app es en **Python**, la skill te recomienda:

```python
from PIL import Image
import json

# Validar dimensiones
SPECS = {
    "feed_cuadrado": (1080, 1080),
    "feed_vertical": (1080, 1350),
    "story": (1080, 1920),
    "carrusel": (1080, 1080)
}

def validate(image_path, formato):
    img = Image.open(image_path)
    assert img.size == SPECS[formato], f"Dimensión incorrecta"
```

---

## 📚 Referencias Incluidas

1. **template-json.md**
   - JSON completo para campañas automáticas
   - Ejemplos MVP (mínimo viable)
   - Código de validación en Python

2. **checklist-casos-uso.md**
   - Checklist completo pre-producción
   - Casos de uso por industria (moda, tech, alimentos)
   - Ejemplos de copy por formato
   - Guía de colores
   - Tamaños de archivo recomendados
   - Pseudocódigo de generación automática

---

## ✨ Ventajas de Usar Esta Skill

1. **Precisión 100%:** Basada en documentación oficial de Meta 2025-2026
2. **Completitud:** Cubre todos los formatos y ubicaciones
3. **Automatización:** Templates listos para integrar en código
4. **Validación:** Checklist para no cometer errores
5. **Casos prácticos:** Ejemplos reales por tipo de negocio
6. **Escalable:** Funciona para 1 anuncio o 1000

---

## ❓ Preguntas Frecuentes

**P: ¿Meta cambió sus especificaciones recientemente?**
R: Esta skill está actualizada a 2026. Meta eliminó la penalización de 20% de texto pero se recomienda mantenerlo bajo.

**P: ¿Puedo usar 1080x1910 en lugar de 1080x1920?**
R: No. Meta requiere exactamente 1080x1920 para Stories, sino aparecen barras negras.

**P: ¿Cuál es el tamaño mínimo para un anuncio?**
R: 1080x1080 para la mayoría. Audience Network acepta desde 398x208 pero no se recomienda.

**P: ¿Necesito generar todas las dimensiones?**
R: Mínimo 3 (feed cuadrado, feed vertical, stories) para cubrir 90% de ubicaciones.

---

## 🎓 Próximos Pasos

1. **Implementa la skill** en tu flujo de trabajo
2. **Usa los templates** JSON para tu app
3. **Valida** con el checklist antes de producción
4. **Itera** basado en performance de Meta
5. **Mantén actualizado:** Revisa documentación oficial anualmente

---

## 📞 Soporte

Si necesitas ayuda:
- Pregunta a Claude mientras tienes acceso a esta skill
- Consulta `references/` para detalles técnicos específicos
- Usa el checklist en `checklist-casos-uso.md` para troubleshooting

---

**Versión:** 1.0  
**Última actualización:** Junio 2026  
**Basado en:** Meta Business Help Center, Meta Ads Manager Docs  

