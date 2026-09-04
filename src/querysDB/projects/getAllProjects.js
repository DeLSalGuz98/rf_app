import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function GetAllListProjects(estado = "") {
  try {
    const resOne = await GetUserNameAndNameCompany();

    if (!resOne?.idEmpresa) {
      toast.error("No se encontró la empresa del usuario");
      return [];
    }

    // 1. Iniciar la consulta base
    let query = supabase
      .from("proyectos")
      .select(`
        id,
        nombre_proyecto,
        tipo,
        descripcion_proyecto,
        fecha_fin,
        fecha_inicio,
        monto_ofertado,
        estado
      `)
      .eq("id_empresa", resOne.idEmpresa);

    // 2. Aplicar el filtro de estado SOLO si se recibe un valor no vacío
    if (estado && estado.trim() !== "") {
      query = query.eq("estado", estado.trim());
    }

    // 3. Ejecutar la consulta
    const { data, error } = await query;

    if (error) {
      console.error("Error en Supabase:", error);
      toast.warning("No se pudo obtener la data");
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error inesperado:", err);
    toast.error("Error interno al obtener proyectos");
    return [];
  }
}