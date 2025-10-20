export async function obtenerRazonSocialPorRUC(ruc) {
  // ⚠️ Importante: Reemplaza estos valores con los de un proveedor de API de RUC en Perú
  const API_URL = "https://dniruc.apisperu.com/api/v1/ruc/" + ruc;// URL de ejemplo
  const API_TOKEN = import.meta.env.VITE_APISPERU_TOKEN; // Token/Key que obtienes del proveedor

  try {
    const response = await fetch(`${API_URL}?token=${API_TOKEN}`);
    
    // Verifica si la petición fue exitosa (código de estado 200)
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // La respuesta JSON del API contendrá la razón social
    // El nombre de la propiedad puede variar según la API (ej: 'razonSocial', 'nombre_razon_social', 'desRazonSocial')
    const razonSocial = data.razonSocial; 

    if (razonSocial) {
      return razonSocial;
    } else {
      console.log(`No se encontró razón social para el RUC: ${ruc}`);
      return null;
    }

  } catch (error) {
    console.error("Hubo un error al consultar el RUC:", error);
    return null;
  }
}

// Ejemplo de uso
// obtenerRazonSocialPorRUC("20608300393");