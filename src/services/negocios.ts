import { supabase } from './supabaseClient';
import type { Negocio, SaldoMarketing, TransaccionMarketing } from '../types/database.types';

/**
 * Obtiene todos los negocios a los que pertenece el usuario logueado.
 */
export async function obtenerNegociosUsuario(usuarioId: string) {
  const { data, error } = await supabase
    .from('negocio_usuarios')
    .select('*, negocios(*)')
    .eq('usuario_id', usuarioId);

  if (error) throw error;
  
  // Transformamos y tipamos el resultado
  return data.map((item: any) => ({
    ...item.negocios,
    rol: item.rol,
    membresiaId: item.id,
    created_at_membresia: item.created_at
  })) as (Negocio & { rol: string; membresiaId: string; created_at_membresia: string })[];
}

/**
 * Crea un nuevo negocio (tenant) y asocia al usuario actual como admin.
 */
export async function crearNegocio(nombre: string, _usuarioId: string) {
  // Insertamos el negocio (el trigger en la base de datos se encargará de crear la membresía y el saldo)
  const { data: negocio, error: errorNegocio } = await supabase
    .from('negocios')
    .insert({ nombre })
    .select()
    .single();

  if (errorNegocio) throw errorNegocio;

  return negocio as Negocio;
}

/**
 * Obtiene el saldo de marketing para un negocio específico.
 */
export async function obtenerSaldoMarketing(negocioId: string) {
  const { data, error } = await supabase
    .from('saldo_marketing')
    .select('*')
    .eq('negocio_id', negocioId)
    .maybeSingle();

  if (error) throw error;
  return data as SaldoMarketing | null;
}

/**
 * Carga saldo manual a un negocio (invoca el RPC cargar_saldo_marketing).
 */
export async function cargarSaldo(negocioId: string, monto: number, descripcion: string, usuarioId: string) {
  const { data, error } = await supabase.rpc('cargar_saldo_marketing', {
    p_negocio_id: negocioId,
    p_monto: monto,
    p_descripcion: descripcion,
    p_usuario_id: usuarioId
  });

  if (error) throw error;
  return data as number; // Retorna el nuevo saldo
}

/**
 * Descuenta saldo de marketing manualmente (invoca el RPC descontar_saldo_marketing).
 * NOTA: Generalmente invocado por Edge Functions internamente.
 */
export async function descontarSaldo(negocioId: string, monto: number, tipo: string, descripcion: string, usuarioId: string) {
  const { data, error } = await supabase.rpc('descontar_saldo_marketing', {
    p_negocio_id: negocioId,
    p_monto: monto,
    p_tipo: tipo,
    p_descripcion: descripcion,
    p_usuario_id: usuarioId
  });

  if (error) {
    if (error.message.includes('Saldo insuficiente')) {
      throw new Error('Saldo insuficiente para realizar esta acción.');
    }
    throw error;
  }
  return data as number; // Retorna el nuevo saldo
}

/**
 * Obtiene el historial de transacciones de créditos de un negocio.
 */
export async function obtenerTransacciones(negocioId: string) {
  const { data, error } = await supabase
    .from('transacciones_marketing')
    .select('*')
    .eq('negocio_id', negocioId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as TransaccionMarketing[];
}
