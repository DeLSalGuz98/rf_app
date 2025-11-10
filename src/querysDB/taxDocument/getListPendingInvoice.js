import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getListPendingInvoice(estadoComprobante = ["pendiente"], tipoDoc = "factura emitida") {
  const res = await GetUserNameAndNameCompany()
  const { data, error } = await supabase
  .from("documentos_tributarios")
  .select(`
    id,
    fecha_emision,
    fecha_vencimiento,
    moneda,
    monto,
    tipo_cambio,
    estado_comprobante,
    proyectos (
      id,
      nombre_proyecto,
      descripcion_proyecto,
      unidad_ejecutora,
      exp_siaf
    )
  `)
  .eq("id_empresa", res.idEmpresa)
  .in("estado_comprobante", estadoComprobante)
  .eq("tipo_doc", tipoDoc);

  if (error){ 
    console.error(error) 
    return null
  }
  return (data) 
}