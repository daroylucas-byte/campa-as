import { supabase } from './supabaseClient';
import type { CampanaCliente, CampanaPost } from '../types/database.types';

/**
 * Obtiene todas las campañas de un cliente específico.
 */
export async function obtenerCampanasCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('campanas_cliente')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CampanaCliente[];
}

/**
 * Obtiene una campaña por su ID.
 */
export async function obtenerCampanaPorId(campanaId: string) {
  const { data, error } = await supabase
    .from('campanas_cliente')
    .select('*')
    .eq('id', campanaId)
    .single();

  if (error) throw error;
  return data as CampanaCliente;
}

/**
 * Crea una nueva campaña para un cliente (comienza en estado 'borrador').
 */
export async function crearCampana(campana: Omit<CampanaCliente, 'id' | 'pilares_semanales' | 'created_at'>) {
  const { data, error } = await supabase
    .from('campanas_cliente')
    .insert({
      ...campana,
      pilares_semanales: null
    })
    .select()
    .single();

  if (error) throw error;
  return data as CampanaCliente;
}

/**
 * Actualiza los campos de una campaña.
 */
export async function actualizarCampana(campanaId: string, updates: Partial<CampanaCliente>) {
  const { data, error } = await supabase
    .from('campanas_cliente')
    .update(updates)
    .eq('id', campanaId)
    .select()
    .single();

  if (error) throw error;
  return data as CampanaCliente;
}

/**
 * Elimina una campaña de la base de datos (las cascadas se encargan de los posts).
 */
export async function eliminarCampana(campanaId: string) {
  const { error } = await supabase
    .from('campanas_cliente')
    .delete()
    .eq('id', campanaId);

  if (error) throw error;
}

/**
 * Obtiene todos los posts generados de una campaña.
 */
export async function obtenerPostsCampana(campanaId: string) {
  const { data, error } = await supabase
    .from('campana_posts')
    .select('*')
    .eq('campana_id', campanaId)
    .order('semana', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as CampanaPost[];
}

/**
 * Obtiene los posts generados para una semana específica de una campaña.
 */
export async function obtenerPostsSemana(campanaId: string, semana: number) {
  const { data, error } = await supabase
    .from('campana_posts')
    .select('*')
    .eq('campana_id', campanaId)
    .eq('semana', semana)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as CampanaPost[];
}

/**
 * Actualiza los detalles de un post específico (ej: aprobar, rechazar, cambiar copy, CTA).
 */
export async function actualizarPost(postId: string, updates: Partial<CampanaPost>) {
  const { data, error } = await supabase
    .from('campana_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data as CampanaPost;
}

/**
 * Elimina todos los posts de una semana específica. 
 * Útil para limpiar la semana si el usuario desea forzar la regeneración.
 */
export async function eliminarPostsDeSemana(campanaId: string, semana: number) {
  const { error } = await supabase
    .from('campana_posts')
    .delete()
    .eq('campana_id', campanaId)
    .eq('semana', semana);

  if (error) throw error;
}

/**
 * Genera el plan de pilares semanales de la campaña (Edge Function generar-campana).
 * Costo: 600 créditos.
 * Devuelve: { pilares, resumen }
 */
export async function ejecutarGenerarCampana(campanaId: string, usuarioId?: string) {
  const { data, error } = await supabase.functions.invoke('generar-campana', {
    body: {
      campana_id: campanaId,
      ...(usuarioId ? { usuario_id: usuarioId } : {})
    }
  });

  if (error) {
    if (error.message?.includes('Saldo insuficiente')) {
      throw new Error('Saldo insuficiente. Se requieren 600 créditos.');
    }
    throw error;
  }

  return data as { pilares: any[]; resumen: string };
}

/**
 * Genera los posts de una semana específica (Edge Function generar-semana-campana).
 * Costo: 600 créditos.
 * Devuelve: { posts: [...] }
 * 
 * Regla de negocio:
 * Falla 400 si la campaña no tiene pilares_semanales todavía o si la semana ya tiene posts.
 */
export async function ejecutarGenerarSemanaCampana(campanaId: string, semana: number, usuarioId?: string) {
  const { data, error } = await supabase.functions.invoke('generar-semana-campana', {
    body: {
      campana_id: campanaId,
      semana,
      ...(usuarioId ? { usuario_id: usuarioId } : {})
    }
  });

  if (error) {
    // Si la llamada falla (ej: error 400 por posts existentes o falta de pilares),
    // propagamos el error para que la UI lo muestre tal cual.
    if (error.message?.includes('Saldo insuficiente')) {
      throw new Error('Saldo insuficiente. Se requieren 600 créditos.');
    }
    throw error;
  }

  return data as { posts: CampanaPost[] };
}

/**
 * Genera la imagen para un post específico (Edge Function generar-imagen-campana).
 * Costo: 1250 créditos.
 * Devuelve: { imagen_url }
 */
export async function ejecutarGenerarImagenCampana(postId: string, usuarioId?: string, sugerenciaUsuario?: string) {
  const { data, error } = await supabase.functions.invoke('generar-imagen-campana', {
    body: {
      post_id: postId,
      ...(usuarioId ? { usuario_id: usuarioId } : {}),
      ...(sugerenciaUsuario ? { sugerencia_usuario: sugerenciaUsuario } : {})
    }
  });

  if (error) {
    if (error.message?.includes('Saldo insuficiente')) {
      throw new Error('Saldo insuficiente. Se requieren 1250 créditos.');
    }
    throw error;
  }

  return data as { imagen_url: string };
}
