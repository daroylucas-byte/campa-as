import { supabase } from './supabaseClient';
import type { Cliente, IdentidadVisualCliente, AnalisisIdentidadCliente, CategoriaIdentidad } from '../types/database.types';

/**
 * Obtiene todos los clientes asociados a un negocio (tenant).
 */
export async function obtenerClientes(negocioId: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('negocio_id', negocioId)
    .order('razon_social', { ascending: true });

  if (error) throw error;
  return data as Cliente[];
}

/**
 * Crea un nuevo cliente para un negocio.
 */
export async function crearCliente(negocioId: string, razonSocial: string) {
  const { data, error } = await supabase
    .from('clientes')
    .insert({ negocio_id: negocioId, razon_social: razonSocial })
    .select()
    .single();

  if (error) throw error;
  return data as Cliente;
}

/**
 * Obtiene la información básica de un cliente por su ID.
 */
export async function obtenerClientePorId(clienteId: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single();

  if (error) throw error;
  return data as Cliente;
}

/**
 * Obtiene el historial de imágenes de identidad visual cargadas para un cliente.
 */
export async function obtenerIdentidadVisual(clienteId: string) {
  const { data, error } = await supabase
    .from('identidad_visual_cliente')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as IdentidadVisualCliente[];
}

/**
 * Sube una imagen de referencia al bucket de storage 'marketing' y registra
 * la entrada en la tabla 'identidad_visual_cliente'.
 */
export async function subirImagenIdentidad(clienteId: string, file: File, descripcion: string, categoria: CategoriaIdentidad = 'otro') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `identidad-clientes/${clienteId}/${timestamp}-${random}.${fileExt}`;

  // 1. Subir el archivo al bucket público 'marketing'
  const { error: uploadError } = await supabase.storage
    .from('marketing')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // 2. Obtener la URL pública del archivo subido
  const { data: { publicUrl } } = supabase.storage
    .from('marketing')
    .getPublicUrl(filePath);

  // 3. Registrar el archivo en la base de datos
  const { data, error: dbError } = await supabase
    .from('identidad_visual_cliente')
    .insert({
      cliente_id: clienteId,
      imagen_url: publicUrl,
      descripcion,
      categoria
    })
    .select()
    .single();

  if (dbError) {
    // Si falla el insert en BD, intentamos limpiar el storage para no dejar basura
    await supabase.storage.from('marketing').remove([filePath]);
    throw dbError;
  }

  return data as IdentidadVisualCliente;
}

/**
 * Elimina una imagen de identidad visual del storage y de la base de datos.
 */
export async function eliminarImagenIdentidad(imagenId: string, clienteId: string, imagenUrl: string) {
  // Extraer el path relativo a partir de la URL pública
  // Ejemplo URL: .../storage/v1/object/public/marketing/identidad-clientes/123/img.jpg
  // El path que necesitamos para remove es: identidad-clientes/123/img.jpg
  const urlParts = imagenUrl.split('/marketing/');
  if (urlParts.length < 2) {
    throw new Error('URL de imagen inválida.');
  }
  const filePath = urlParts[1];

  // 1. Eliminar de la base de datos
  const { error: dbError } = await supabase
    .from('identidad_visual_cliente')
    .delete()
    .eq('id', imagenId)
    .eq('cliente_id', clienteId);

  if (dbError) throw dbError;

  // 2. Eliminar del storage
  const { error: storageError } = await supabase.storage
    .from('marketing')
    .remove([filePath]);

  // Si falla la eliminación en storage solo logueamos la advertencia para no truncar la UI
  if (storageError) {
    console.warn('No se pudo borrar el archivo físico del storage:', storageError);
  }
}

/**
 * Actualiza la categoría de una imagen de identidad visual.
 */
export async function actualizarCategoriaIdentidad(imagenId: string, categoria: CategoriaIdentidad) {
  const { data, error } = await supabase
    .from('identidad_visual_cliente')
    .update({ categoria })
    .eq('id', imagenId)
    .select()
    .single();

  if (error) throw error;
  return data as IdentidadVisualCliente;
}

/**
 * Obtiene el último análisis de identidad realizado para el cliente.
 */
export async function obtenerAnalisisIdentidad(clienteId: string) {
  const { data, error } = await supabase
    .from('analisis_identidad_cliente')
    .select('*')
    .eq('cliente_id', clienteId)
    .maybeSingle();

  if (error) throw error;
  return data as AnalisisIdentidadCliente | null;
}

/**
 * Llama a la Edge Function 'analizar-identidad-cliente' para analizar las imágenes del cliente.
 * Costo: 1500 créditos.
 */
export async function ejecutarAnalizarIdentidad(clienteId: string, usuarioId?: string) {
  const { data, error } = await supabase.functions.invoke('analizar-identidad-cliente', {
    body: {
      cliente_id: clienteId,
      ...(usuarioId ? { usuario_id: usuarioId } : {})
    }
  });

  if (error) {
    // Manejo personalizado de errores comunes
    if (error.message?.includes('Saldo insuficiente')) {
      throw new Error('Saldo insuficiente. Se requieren 1500 créditos.');
    }
    throw error;
  }

  // Debería retornar { estilo_descripcion }
  return data as AnalizarIdentidadOutput;
}

interface AnalizarIdentidadOutput {
  estilo_descripcion: string;
}
