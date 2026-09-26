import { toast } from "react-toastify";
import { registerUser } from "../../services/registerUser";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

/**
 * Sanitiza valores de un objeto, convirtiendo cadenas vacías "" a null.
 * Esto evita errores de sintaxis en PostgreSQL (por ejemplo, en tipos DATE, UUID o INTEGER).
 */
function sanitizePayload(data) {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = value === "" ? null : value;
  }
  return sanitized;
}

/**
 * Registra un nuevo empleado en la base de datos y, opcionalmente,
 * crea su cuenta de usuario y credenciales en Supabase Auth si se proporciona 'usuario'.
 *
 * @param {Object|null} usuario - Datos del usuario para la tabla 'usuario', o null/undefined si no lleva credenciales.
 * @param {Object} empleado - Datos del empleado para la tabla 'empleado'.
 * @param {string} [password] - Contraseña para la cuenta Auth (requerida solo si 'usuario' no es null).
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function saveNewWorkerCompanyDB(usuario, empleado, password) {
  // 1. Obtener identificador de empresa del contexto actual
  const res = await GetUserNameAndNameCompany();

  if (!res?.idEmpresa) {
    throw new Error("No se pudo obtener el identificador de la empresa.");
  }

  let usuarioCreadoId = null;

  // 2. REGISTRO OPCIONAL DE USUARIO
  // Solo entra aquí si 'usuario' viene con un objeto válido y no es null/undefined
  if (usuario && Object.keys(usuario).length > 0) {
    if (!empleado.email || !password) {
      throw new Error("Se requieren un correo electrónico y una contraseña para asignar credenciales de usuario.");
    }

    // A. Registrar en Supabase Auth
    const { user } = await registerUser(empleado.email, password);

    if (!user?.id) {
      toast.error("No se pudo crear la cuenta de autenticación");
      throw new Error("No se pudo crear la cuenta de autenticación.");
    }

    // B. Preparar payload de tabla 'usuario' sanitizando cadenas vacías
    const usuarioPayload = sanitizePayload({
      ...usuario,
      id: user.id,
    });

    // C. Insertar en tabla 'usuario'
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuario")
      .insert(usuarioPayload)
      .select();

    if (usuarioError) {
      toast.error("Error al guardar datos de usuario");
      throw new Error(`Error al guardar datos de usuario: ${usuarioError.message}`);
    }

    if (!usuarioData || usuarioData.length === 0) {
      toast.error("No se pudo obtener la confirmación del usuario registrado.");
      throw new Error("No se pudo obtener la confirmación del usuario registrado.");
    }

    usuarioCreadoId = usuarioData[0].id;
  }

  // 3. REGISTRO DE EMPLEADO (Siempre se ejecuta)
  // Clean and sanitize employee payload
  const empleadoSanitizado = sanitizePayload(empleado);

  const empleadoPayload = {
    ...empleadoSanitizado,
    empresa_id: res.idEmpresa,
    usuario_id: usuarioCreadoId, // Si no hubo usuario, esto será null explícitamente
  };

  const { error: empleadoError } = await supabase
    .from("empleado")
    .insert(empleadoPayload);

  if (empleadoError) {
    toast.error("Error al registrar el empleado");
    throw new Error(`Error al registrar el empleado: ${empleadoError.message}`);
  }

  return {
    success: true,
    message: usuarioCreadoId
      ? toast.success("Trabajador y usuario registrados correctamente. Se envió un correo de confirmación.")
      : toast.success("Trabajador registrado correctamente sin acceso a sistema.")
  };
}