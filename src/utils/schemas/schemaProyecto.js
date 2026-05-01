import { z } from "zod";

export const proyectoSchema = z.object({
  nombre_proyecto: z.string().min(3, "Requerido"),
  descripcion_proyecto: z.string().optional(),
  direccion: z.string().optional(),
  distrito: z.string().optional(),
  provincia: z.string().optional(),
  departamento: z.string().optional(),

  fecha_inicio: z.string(),
  plazo_dias: z.coerce.number().min(1),
  monto_ofertado: z.coerce.number().min(0),

  tipo: z.enum(["privado", "orden compra", "orden servicio"]),

  ruc_cliente: z.string().min(8, "RUC inválido"),
  rs_cliente: z.string().min(3, "Requerido"),

  unidad_ejecutora: z.string().optional(),
  exp_siaf: z.string().optional(),
});