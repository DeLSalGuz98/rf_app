import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getDocsToMainDashDB(){
  const res = await GetUserNameAndNameCompany()
  const today = new Date();
  // Restar 12 meses a la fecha actual
  const lastYear = new Date();
  lastYear.setMonth(today.getMonth() - 12);

  // Convertir al formato ISO (YYYY-MM-DD)
  const lastYearISO = lastYear.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("documentos_tributarios")
    .select(`
      mes_declarado,
      moneda,
      monto,
      tipo_cambio,
      tipo_doc
    `)
    .eq("id_empresa", res.idEmpresa)
    .gte('fecha_emision', lastYearISO);

  if (error) {
    console.error("Error al obtener los gastos:", error);
    return [];
  }
  const dataDocs = estructurarDatos(data)
  return(dataDocs)
  
}
function estructurarDatos(data){
  // 1. Agrupar y Sumar los Montos
    const totalesPorMes = data.reduce((acumulador, item) => {
        const mes = item.mes_declarado;
        const monto = item.moneda==="USD"?item.monto*item.tipo_cambio:item.monto || 0; // Usar 0 si el monto es null/undefined
        const tipoDoc = item.tipo_doc;

        if (!mes) return acumulador; // Saltar si no hay mes

        // Inicializar el objeto del mes si es la primera vez que se encuentra
        if (!acumulador[mes]) {
            acumulador[mes] = {
                factRecibidas: 0,
                factEmitidas: 0,
                ncRecibidas:0,
                ncEmitidas:0,
                retencionRecibida:0
            };
        }

        // Sumar al tipo de documento correspondiente
        if (tipoDoc === 'factura recibida') {
            acumulador[mes].factRecibidas += monto;
        } else if (tipoDoc === 'factura emitida') {
            acumulador[mes].factEmitidas += monto;
        }else if (tipoDoc === 'nc emitido') {
            acumulador[mes].ncEmitidas += monto;
        }else if (tipoDoc === 'nc recibido') {
            acumulador[mes].ncRecibidas += monto;
        }
        else if (tipoDoc === 'retencion recibido') {
            acumulador[mes].retencionRecibida += monto;
        }
        
        // Se ignoran otros tipos de documentos como 'retencion recibido'
        
        return acumulador;
    }, {}); // El valor inicial del acumulador es un objeto vacío ({})

    // 2. Formatear y Ordenar
    let resultadoFinal = Object.entries(totalesPorMes).map(([mes, totales]) => ({
        mes_declarado: mes,
        // Redondear a 2 decimales para la moneda
        total_facturas_recibidas: parseFloat(totales.factRecibidas.toFixed(2)),
        total_facturas_emitidas: parseFloat(totales.factEmitidas.toFixed(2)),
        total_nc_emitidas: parseFloat(totales.ncEmitidas.toFixed(2)),
        total_nc_recibidas: parseFloat(totales.ncRecibidas.toFixed(2)),
        total_retenciones_recibidas: parseFloat(totales.retencionRecibida.toFixed(2)),
    }));

    // Ordenar cronológicamente por 'mes_declarado' (YYYY-MM)
    resultadoFinal.sort((a, b) => a.mes_declarado.localeCompare(b.mes_declarado));

    // Si solo se quieren los últimos 12 meses, se puede usar:
    // return resultadoFinal.slice(-12);

    return resultadoFinal;
}
