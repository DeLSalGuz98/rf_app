import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { frmtFecha } from "../../utils/formatDate";

export async function getListExpenditureProject(idProyecto) {
  const {data, error} = await supabase.from("gastos").select("*").eq("id_proyecto", idProyecto).order("fecha", { ascending: false })
  if(error){
    console.error(error)
    toast.error("Error al obtener los datos")
    return null
  }
  const listExpenditure = []
  data.map(gasto =>{
    listExpenditure.push({...gasto, fecha: frmtFecha(gasto.fecha)})
  })
  return listExpenditure
}

export async function getListExpenditureProjectDB(idProyecto) {
  const {data, error} = await supabase.from("gastos").select(`
    id,
    tipo,
    categoria,
    cantidad,
    unidadMedida:unidad_medida,
    descripcion,
    precioUnitario:precio_unitario,
    moneda,
    tipoCambio:tipo_cambio,
    total:monto_total,
    fecha,
    serieComprobante:serie_comprobante,
    nroComprobante:nro_comprobante
    `).eq("id_proyecto", idProyecto).order("fecha", { ascending: false })
  if(error){
    console.error(error)
    toast.error("Error al obtener los datos")
    return null
  }
  return data
}