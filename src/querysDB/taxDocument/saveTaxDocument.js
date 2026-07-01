import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function saveTaxDocumentDB(taxDocData = {}, idProject = "") {
  try {
    const res = await GetUserNameAndNameCompany();

    // 1. Validar duplicados
    const duplicated = await isDocDuplicated(taxDocData);
    if (duplicated) {
      toast.warning("Este documento ya existe, verifique los datos");
      throw new Error("El documento ya existe");
    }

    // 2. Mapear datos limpios del comprobante
    const invoiceData = {
      tipo_doc: taxDocData.tipo_doc,
      estado_comprobante: taxDocData.estado_comprobante,
      fecha_emision: taxDocData.fecha_emision,
      fecha_vencimiento: taxDocData.fecha_vencimiento,
      mes_declarado: taxDocData.mes_declarado,
      serie_comprobante: taxDocData.serie_comprobante,
      nro_comprobante: taxDocData.nro_comprobante,
      ruc: taxDocData.ruc,
      razon_social: taxDocData.razon_social,
      moneda: taxDocData.moneda,
      monto: taxDocData.monto,
    };

    // 3. Insertar registro principal
    const { data, error } = await supabase
      .from("documentos_tributarios")
      .insert({
        ...invoiceData,
        id_empresa: res.idEmpresa,
        id_proyecto: idProject !== "" ? idProject : null,
        id_usuario: res.idUser,
        tipo_cambio: taxDocData.tipo_cambio && taxDocData.tipo_cambio !== 0 ? taxDocData.tipo_cambio : null,
      })
      .select("id, id_usuario")
      .single();

    // 4. Verificar inmediatamente si hubo error en la inserción principal
    if (error) {
      console.error("Error al insertar en documentos_tributarios:", error);
      toast.error("Error. No se pudo guardar el documento principal");
      throw new Error(`Fallo al guardar en DB: ${error.message}`);
    }

    // 5. Inserciones condicionales secundarias (CON AWAIT)
    if (taxDocData.tipo_doc === "factura emitida" || taxDocData.tipo_doc === "factura recibida") {
      await ifDocIsInvoice(taxDocData, data);
    }

    // Corregido "emitido/recibido" para hacer match con el formulario
    if (taxDocData.tipo_doc === "nc emitido" || taxDocData.tipo_doc === "nc recibido") {
      await ifDocIsNC(taxDocData, data);
    }

    toast.success("Datos guardados correctamente");
    return data;

  } catch (err) {
    // Captura cualquier error arrojado en la cadena y evita crasheos de UI
    console.error("Error en flujo saveTaxDocumentDB:", err);
    throw err;
  }
}

async function isDocDuplicated(dataDoc) {
  const { data, error } = await supabase
    .from("documentos_tributarios")
    .select("id") // Solo selecciona el ID para no sobrecargar de datos la red
    .eq("fecha_emision", dataDoc.fecha_emision)
    .eq("serie_comprobante", dataDoc.serie_comprobante)
    .eq("nro_comprobante", dataDoc.nro_comprobante)
    .eq("ruc", dataDoc.ruc);

  if (error) {
    console.error("Error buscando duplicados:", error);
    throw new Error(`Error al verificar duplicados: ${error.message}`);
  }

  return data && data.length !== 0;
}

async function ifDocIsInvoice(taxDocData, dataDocInvoice) {
  const dataInvoice = {
    sujeto_detraccion: taxDocData.sujeto_detraccion || false,
    porcentaje_detraccion: taxDocData.porcentaje_detraccion || null,
    monto_detraccion: taxDocData.monto_detraccion || null,
    id_comprobante: dataDocInvoice.id,
    id_usuario: dataDocInvoice.id_usuario,
  };

  const { error } = await supabase.from("factura").insert(dataInvoice);

  if (error) {
    console.error("Error al insertar detalle de Factura:", error);
    toast.error("Error al guardar detalles de detracción");
    throw new Error(`Fallo al guardar detracción en DB: ${error.message}`);
  }
}

async function ifDocIsNC(taxDocData, dataDocInvoice) {
  const dataNc = {
    serie_factura_afectada: taxDocData.serie_factura_afectada,
    nro_factura_afectada: taxDocData.nro_factura_afectada,
    motivo_sustento: taxDocData.motivo_sustento,
    id_comprobante: dataDocInvoice.id,
    id_usuario: dataDocInvoice.id_usuario,
  };

  // NOTA: Asegúrate de si la tabla destino debe ser "nota_credito" o si realmente guardas las NC en "factura"
  const { error } = await supabase.from("nota_credito").insert(dataNc);

  if (error) {
    console.error("Error al insertar detalle de Nota de Crédito:", error);
    toast.error("Error al guardar referencia de Nota de Crédito");
    throw new Error(`Fallo al guardar Nota de Crédito en DB: ${error.message}`);
  }
}