import { supabase } from "../../services/supabaseClient";

export async function getInfoProject(idProyecto) {
  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .eq("id", idProyecto)
    .single();

  if (error) {
    console.error(error)
    return null
  };
  return data
}
/**
 * Obtiene la información general de un proyecto por su ID,
 * mapeando las columnas de snake_case a camelCase mediante alias de PostgREST.
 *
 * @param {string|number} idProyecto - Identificador único del proyecto.
 * @returns {Promise<Object|null>} Objeto con los datos del proyecto o null si ocurre un error.
 */
export async function getInfoProjectDB(idProyecto) {
  if (!idProyecto) return null;

  const { data, error } = await supabase
    .from("proyectos")
    .select(`
      id,
      nombreProyecto:nombre_proyecto,
      descripcion:descripcion_proyecto,
      direccion,
      distrito,
      provincia,
      departamento,
      fechaInicio:fecha_inicio,
      plazoEntrega:plazo_dias,
      fechaEntrega:fecha_fin,
      montoProyecto:monto_ofertado,
      tipo,
      rucCliente:ruc_cliente,
      razonSocial:rs_cliente,
      unidadEjecutora:unidad_ejecutora,
      expSiaf:exp_siaf,
      estadoProyecto:estado
    `)
    .eq("id", idProyecto)
    .single();

  if (error) {
    console.error("Error al obtener información del proyecto:", error.message);
    return null;
  }

  return data;
}