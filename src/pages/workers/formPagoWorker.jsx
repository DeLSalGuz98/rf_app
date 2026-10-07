import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, Button, Card, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { obtenerRazonSocialPorRUC } from '../../utils/rsPorRuc';
import { useLocation, useNavigate } from 'react-router-dom';
import { savePagoDataDB } from '../../querysDB/workers/savePagoData';

// 1. Esquema de Validación con Zod (JavaScript)
const pagoWorkerSchema = z.object({
  fecha_registro: z.string().min(1, 'La fecha de registro es requerida'),
  monto_pago: z.coerce
    .number({ invalid_type_error: 'Ingrese un monto válido' })
    .positive('El monto debe ser un valor positivo'),
  periodo: z.string().min(1, 'El periodo es requerido'),
  tipo_pago: z.enum(['pago_semanal', 'fin_de_mes', 'adelanto', 'bono', 'liquidacion'], {
    errorMap: () => ({ message: 'Seleccione un tipo de pago válido' })
  }),
  forma_pago: z.enum(['transferencia', 'efectivo', 'yape_plin', 'deposito'], {
    errorMap: () => ({ message: 'Seleccione una forma de pago válida' })
  }),

  incluir_comprobante: z.boolean().default(false),

  comprobante: z.object({
    tipo_doc: z.string().default('r.h. recibido'),
    estado_comprobante: z.enum(['pendiente', 'pagado', 'atrasado', 'anulado', 'archivado']),
    fecha_emision: z.string().optional(),
    fecha_vencimiento: z.string().optional(),
    mes_declarado: z.string().optional(),
    serie_comprobante: z.string().optional(),
    nro_comprobante: z.string().optional(),
    ruc: z.string().refine((val) => val === '' || /^\d{11}$/.test(val), {
      message: 'El RUC debe contener exactamente 11 dígitos numéricos'
    }).optional(),
    razon_social: z.string().optional(),
    moneda: z.enum(['PEN', 'USD']),
    tipo_cambio: z.coerce.number().optional(),
    monto: z.coerce.number().optional()
  }).optional()
}).superRefine((data, ctx) => {
  if (data.incluir_comprobante && data.comprobante?.moneda === 'USD') {
    if (!data.comprobante.tipo_cambio || data.comprobante.tipo_cambio <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El tipo de cambio es requerido para pagos en USD',
        path: ['comprobante', 'tipo_cambio']
      });
    }
  }
});

export function FormPagoWorker() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingRuc, setLoadingRuc] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(pagoWorkerSchema),
    defaultValues: {
      fecha_registro: new Date().toISOString().split('T')[0],
      monto_pago: '',
      periodo: new Date().toISOString().slice(0, 7),
      tipo_pago: 'fin_de_mes',
      forma_pago: 'transferencia',
      incluir_comprobante: false,
      comprobante: {
        tipo_doc: 'r.h. recibido',
        estado_comprobante: 'archivado',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        mes_declarado: new Date().toISOString().slice(0, 7),
        serie_comprobante: 'E001',
        nro_comprobante: '',
        ruc: '',
        razon_social: '',
        moneda: 'PEN',
        tipo_cambio: 3.75,
        monto: ''
      }
    }
  });

  const { id_empleado, id_proyecto } = location.state || {};

  // Observadores de estado en vivo
  const incluirComprobante = useWatch({ control, name: 'incluir_comprobante' });
  const monedaSeleccionada = useWatch({ control, name: 'comprobante.moneda' });
  const montoPago = useWatch({ control, name: 'monto_pago' });
  const rucNumber = useWatch({ control, name: 'comprobante.ruc' });

  // 1. Sincronización automática de monto principal a comprobante
  useEffect(() => {
    if (montoPago && incluirComprobante) {
      setValue('comprobante.monto', montoPago, { shouldValidate: true });
    }
  }, [montoPago, incluirComprobante, setValue]);

  // 2. Consulta RUC optimizada (Debounce + Cancelación)
  const fetchRazonSocial = useCallback(async (ruc, signal) => {
    try {
      setLoadingRuc(true);
      const res = await obtenerRazonSocialPorRUC(ruc);
      if (!signal.aborted && res) {
        setValue('comprobante.razon_social', res, { shouldValidate: true });
      }
    } catch (error) {
      console.error('Error al consultar RUC:', error);
    } finally {
      if (!signal.aborted) setLoadingRuc(false);
    }
  }, [setValue]);

  useEffect(() => {
    const controller = new AbortController();

    if (rucNumber && rucNumber.length === 11) {
      const timer = setTimeout(() => {
        fetchRazonSocial(rucNumber, controller.signal);
      }, 500);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    } else if (!rucNumber) {
      setValue('comprobante.razon_social', '');
    }
  }, [rucNumber, fetchRazonSocial, setValue]);

  const onCancel = () => navigate(-1);

  const onSubmitForm = async (data) => {
    const payload = {
      id_empleado,
      id_proyecto,
      fecha_registro: data.fecha_registro,
      monto_pago: Number(data.monto_pago),
      periodo: data.periodo,
      tipo_pago: data.tipo_pago,
      forma_pago: data.forma_pago,
      comprobante_tributario: data.incluir_comprobante
        ? {
            ...data.comprobante,
            tipo_cambio: data.comprobante.moneda === 'USD' ? Number(data.comprobante.tipo_cambio) : null,
            monto: Number(data.comprobante.monto)
          }
        : null
    };
    const res = await savePagoDataDB(payload)
    if(res?.status === "ok"){
      navigate(-1)
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-cash-stack me-2"></i>
          Registro de Pago a Personal
        </h5>
      </Card.Header>

      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit(onSubmitForm)}>
          
          {/* SECCIÓN 1: DATOS BÁSICOS DEL PAGO */}
          <div className="mb-4">
            <h6 className="text-secondary fw-bold text-uppercase fs-7 mb-3">
              1. Detalles Operativos del Pago
            </h6>

            <Row className="g-3">
              <Form.Group as={Col} md={4}>
                <Form.Label className="fw-semibold">Fecha de Registro</Form.Label>
                <Form.Control
                  type="date"
                  {...register('fecha_registro')}
                  isInvalid={!!errors.fecha_registro}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fecha_registro?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={4}>
                <Form.Label className="fw-semibold">Monto del Pago</Form.Label>
                <InputGroup isInvalid={!!errors.monto_pago}>
                  <InputGroup.Text>S/</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('monto_pago')}
                    isInvalid={!!errors.monto_pago}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.monto_pago?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group as={Col} md={4}>
                <Form.Label className="fw-semibold">Periodo Correspondiente</Form.Label>
                <Form.Control
                  type="month"
                  {...register('periodo')}
                  isInvalid={!!errors.periodo}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.periodo?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6}>
                <Form.Label className="fw-semibold">Tipo de Pago</Form.Label>
                <Form.Select {...register('tipo_pago')} isInvalid={!!errors.tipo_pago}>
                  <option value="fin_de_mes">Sueldo / Fin de Mes</option>
                  <option value="pago_semanal">Sueldo / Pago semanal</option>
                  <option value="adelanto">Adelanto</option>
                  <option value="bono">Bono / Gratuidad</option>
                  <option value="liquidacion">Liquidación / Final</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.tipo_pago?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6}>
                <Form.Label className="fw-semibold">Forma de Pago</Form.Label>
                <Form.Select {...register('forma_pago')} isInvalid={!!errors.forma_pago}>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="deposito">Depósito en Cuenta</option>
                  <option value="yape_plin">Yape / Plin</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.forma_pago?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
          </div>

          <hr className="my-4 text-muted" />

          {/* SECCIÓN 2: COMPROBANTE TRIBUTARIO (OPCIONAL) */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="text-secondary fw-bold text-uppercase fs-7 mb-1">
                  2. Documento Tributario Asignado
                </h6>
                <small className="text-muted">
                  Opcional. Active esta casilla si el trabajador emite Recibo por Honorarios u otro documento fiscal.
                </small>
              </div>
              <Form.Check
                type="switch"
                id="custom-switch-comprobante"
                label="Asignar Comprobante"
                className="fw-bold"
                {...register('incluir_comprobante')}
              />
            </div>

            {incluirComprobante && (
              <Card className="bg-light border p-3 rounded-3 mt-3">
                <Row className="g-3">
                  <Form.Group as={Col} md={4}>
                    <Form.Label className="fw-semibold">Tipo de Documento</Form.Label>
                    <Form.Control
                      type="text"
                      readOnly
                      disabled
                      {...register('comprobante.tipo_doc')}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={4}>
                    <Form.Label className="fw-semibold">Estado del Comprobante</Form.Label>
                    <Form.Select {...register('comprobante.estado_comprobante')}>
                      <option value="pendiente">Pendiente</option>
                      <option value="pagado">Pagado</option>
                      <option value="atrasado">Atrasado</option>
                      <option value="anulado">Anulado</option>
                      <option value="archivado">Archivado</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group as={Col} md={4}>
                    <Form.Label className="fw-semibold">Mes Declarado</Form.Label>
                    <Form.Control type="month" {...register('comprobante.mes_declarado')} />
                  </Form.Group>

                  <Form.Group as={Col} md={6}>
                    <Form.Label className="fw-semibold">RUC del Emisor</Form.Label>
                    <InputGroup isInvalid={!!errors.comprobante?.ruc}>
                      <Form.Control
                        type="text"
                        maxLength={11}
                        placeholder="Ej. 10405060701"
                        {...register('comprobante.ruc')}
                        isInvalid={!!errors.comprobante?.ruc}
                      />
                      {loadingRuc && (
                        <InputGroup.Text>
                          <Spinner animation="border" size="sm" role="status" />
                        </InputGroup.Text>
                      )}
                    </InputGroup>
                    <Form.Control.Feedback type="invalid">
                      {errors.comprobante?.ruc?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} md={6}>
                    <Form.Label className="fw-semibold">Nombre del Trabajador / Razón Social</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Razón Social o Nombre Completo"
                      {...register('comprobante.razon_social')}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={3}>
                    <Form.Label className="fw-semibold">Serie</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="E001"
                      {...register('comprobante.serie_comprobante')}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={3}>
                    <Form.Label className="fw-semibold">N° Comprobante</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="000001"
                      {...register('comprobante.nro_comprobante')}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md={3}>
                    <Form.Label className="fw-semibold">Fecha Emisión</Form.Label>
                    <Form.Control type="date" {...register('comprobante.fecha_emision')} />
                  </Form.Group>

                  <Form.Group as={Col} md={3}>
                    <Form.Label className="fw-semibold">Fecha Vencimiento</Form.Label>
                    <Form.Control type="date" {...register('comprobante.fecha_vencimiento')} />
                  </Form.Group>

                  <Form.Group as={Col} md={4}>
                    <Form.Label className="fw-semibold">Moneda</Form.Label>
                    <Form.Select {...register('comprobante.moneda')}>
                      <option value="PEN">Soles (PEN)</option>
                      <option value="USD">Dólares (USD)</option>
                    </Form.Select>
                  </Form.Group>

                  {monedaSeleccionada === 'USD' && (
                    <Form.Group as={Col} md={4}>
                      <Form.Label className="fw-semibold text-primary">
                        Tipo de Cambio (S/)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="0.001"
                        placeholder="3.750"
                        {...register('comprobante.tipo_cambio')}
                        isInvalid={!!errors.comprobante?.tipo_cambio}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.comprobante?.tipo_cambio?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}

                  <Form.Group as={Col} md={monedaSeleccionada === 'USD' ? 4 : 8}>
                    <Form.Label className="fw-semibold">Monto Comprobante</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>{monedaSeleccionada === 'USD' ? '$' : 'S/'}</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        {...register('comprobante.monto')}
                      />
                    </InputGroup>
                  </Form.Group>
                </Row>
              </Card>
            )}
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Button variant="outline-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>

            <Button variant="primary" type="submit" disabled={isSubmitting} className="px-4">
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                'Registrar Pago'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}