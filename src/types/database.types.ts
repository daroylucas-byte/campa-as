export type RolUsuario = 'admin' | 'editor';

export type ObjetivoCampana = 'awareness' | 'leads' | 'ventas' | 'engagement' | 'trafico';

export type EstadoCampana = 'borrador' | 'activa' | 'archivada';

export type TipoContenidoPost = 'carousel' | 'reel' | 'video' | 'imagen' | 'story';

export type EstadoPost = 'pendiente' | 'aprobada' | 'rechazada';

export type ObjetivoPost = 'awareness' | 'engagement' | 'conversion' | 'retencion';

// 1. negocios
export interface Negocio {
  id: string;
  nombre: string;
  created_at: string;
}

// 2. negocio_usuarios
export interface NegocioUsuario {
  id: string;
  negocio_id: string;
  usuario_id: string;
  rol: RolUsuario;
  created_at: string;
}

// 3. clientes
export interface Cliente {
  id: string;
  negocio_id: string;
  razon_social: string;
  created_at: string;
}

export type CategoriaIdentidad = 'logo' | 'flyer' | 'post' | 'foto_producto' | 'otro';

// 4. identidad_visual_cliente
export interface IdentidadVisualCliente {
  id: string;
  cliente_id: string;
  imagen_url: string;
  descripcion: string;
  categoria: CategoriaIdentidad;
  created_at: string;
}

// 5. analisis_identidad_cliente
export interface AnalisisIdentidadCliente {
  id: string;
  cliente_id: string;
  estilo_descripcion: string;
  updated_at: string;
}

// Estructura de un pilar semanal
export interface PilarSemanal {
  semana: number;
  eje: string;
  enfoque: string;
}

// 6. campanas_cliente
export interface CampanaCliente {
  id: string;
  cliente_id: string;
  nombre_campana: string;
  fecha_inicio: string; // date
  fecha_fin: string; // date
  objetivo: ObjetivoCampana;
  meta_cuantificable: string;
  plataformas: string[];
  publico_objetivo: string;
  contexto_extra: string;
  pilares_semanales: PilarSemanal[] | null;
  estado: EstadoCampana;
  created_at: string;
}

// 7. campana_posts
export interface CampanaPost {
  id: string;
  campana_id: string;
  semana: number; // 1-4
  fecha: string | null; // calculada desde fecha_inicio + semana + día devuelto por la IA; NULL si no se pudo resolver el día
  plataforma: string;
  tipo_contenido: TipoContenidoPost;
  hora_sugerida: string;
  hook: string;
  copy: string;
  cta: string;
  hashtags: string[];
  objetivo_post: ObjetivoPost;
  imagen_url: string | null;
  imagenes_urls?: string[] | null;
  formato_imagen?: 'simple' | 'feed' | 'carrusel' | null;
  estado: EstadoPost;
  created_at: string;
}

// 8. saldo_marketing
export interface SaldoMarketing {
  id: string;
  negocio_id: string;
  saldo: number;
}

// 9. transacciones_marketing
export interface TransaccionMarketing {
  id: string;
  negocio_id: string;
  tipo: string;
  monto: number;
  descripcion: string;
  usuario_id: string;
  created_at: string;
}

// Parámetros y salidas de Edge Functions
export interface AnalizarIdentidadInput {
  cliente_id: string;
  usuario_id?: string;
}

export interface AnalizarIdentidadOutput {
  estilo_descripcion: string;
}

export interface GenerarCampanaInput {
  campana_id: string;
  usuario_id?: string;
}

export interface GenerarCampanaOutput {
  pilares: PilarSemanal[];
  resumen: string;
}

export interface GenerarSemanaCampanaInput {
  campana_id: string;
  semana: number; // 1-4
  usuario_id?: string;
}

export interface GenerarSemanaCampanaOutput {
  posts: Partial<CampanaPost>[];
}

export interface GenerarImagenCampanaInput {
  post_id: string;
  usuario_id?: string;
  sugerencia_usuario?: string;
  formato?: 'simple' | 'feed' | 'carrusel';
}

export interface GenerarImagenCampanaOutput {
  imagen_url: string;
  imagenes_urls: string[];
  formato: string;
}
