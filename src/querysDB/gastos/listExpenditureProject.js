import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { formatDate } from "../../utils/formatDate";

export async function getListExpenditureProject(idProyecto) {
  const {data, error} = await supabase.from("gastos").select("*").eq("id_proyecto", idProyecto).order("fecha", { ascending: true })
  if(error){
    console.error(error)
    toast.error("Error al obtener los datos")
    return null
  }
  const listExpenditure = []
  data.map(gasto =>{
    listExpenditure.push({...gasto, fecha: formatDate(gasto.fecha)})
  })
  return listExpenditure
}