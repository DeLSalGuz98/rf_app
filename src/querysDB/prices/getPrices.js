import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getItemAndPriceDB(nombreItem) {
  const queryTerm = nombreItem.includes('%') 
    ? nombreItem 
    : `%${nombreItem}%`;

  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .ilike('descripcion', queryTerm) // ilike respetará los % que el usuario puso
    .limit(10);
  if(error){
    toast.error("No se pudo obtener los datos")
    console.error(error)
    return null
  }
  return data
}