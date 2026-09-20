-- Crear tabla usuario
create table public.usuario (
  id uuid not null,
  username text not null,
  permisos text not null,
  constraint usuario_pkey primary key (id),
  constraint usuario_username_key unique (username)
) TABLESPACE pg_default;
-- Tabla EMPRESA
create table public.empresa (
  id uuid not null default gen_random_uuid (),
  ruc character varying(11) not null,
  razon_social text not null,
  direccion text not null,
  distrito text not null,
  provincia text not null,
  departamento text not null,
  representante_legal text not null,
  correo text not null,
  constraint empresa_pkey primary key (id),
  constraint empresa_correo_key unique (correo),
  constraint empresa_ruc_key unique (ruc)
) TABLESPACE pg_default;

-- Tabla EMPLEADO
create table public.empleado (
  id uuid not null default gen_random_uuid (),
  nombre text not null,
  apellido_paterno text not null,
  apellido_materno text not null,
  fecha_nacimiento date not null,
  sexo text null,
  telf text null,
  email text not null,
  tipo_doc text null,
  nro_doc text not null,
  activo boolean not null default true,
  tipo_trabajo text null,
  tipo_contrata text null,
  fecha_inicio date not null,
  fecha_fin date null,
  empresa_id uuid not null,
  usuario_id uuid null,
  constraint empleado_pkey primary key (id),
  constraint empleado_nro_doc_key unique (nro_doc),
  constraint empleado_email_key unique (email),
  constraint empleado_usuario_id_key unique (usuario_id),
  constraint empleado_empresa_id_fkey foreign KEY (empresa_id) references empresa (id) on delete CASCADE,
  constraint empleado_usuario_id_fkey foreign KEY (usuario_id) references usuario (id) on delete set null,
  constraint empleado_sexo_check check (
    (
      sexo = any (array['masculino'::text, 'femenino'::text])
    )
  )
) TABLESPACE pg_default;

create table public.proyectos (
  id uuid not null default gen_random_uuid (),
  nombre_proyecto text not null,
  descripcion_proyecto text null,
  direccion text null,
  distrito text null,
  provincia text null,
  departamento text null,
  fecha_inicio date not null,
  plazo_dias integer not null,
  fecha_fin date null,
  monto_ofertado numeric(15, 2) null,
  tipo text null,
  ruc_cliente character varying(11) null,
  rs_cliente text null,
  unidad_ejecutora text null,
  exp_siaf text null,
  estado text null,
  id_empresa uuid not null,
  id_usuario uuid not null,
  constraint proyectos_pkey primary key (id),
  constraint proyectos_id_empresa_fkey foreign KEY (id_empresa) references empresa (id) on delete CASCADE,
  constraint proyectos_id_usuario_fkey foreign KEY (id_usuario) references usuario (id) on delete CASCADE,
  constraint proyectos_estado_check check (
    (
      estado = any (
        array[
          'pendiente'::text,
          'paralizado'::text,
          'entregado'::text,
          'pagado'::text,
          'finalizado'::text
        ]
      )
    )
  ),
  constraint proyectos_tipo_check check (
    (
      tipo = any (
        array[
          'privado'::text,
          'orden compra'::text,
          'orden servicio'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;
create table public.documentos_tributarios (
  id uuid not null default gen_random_uuid (),
  tipo_doc text not null,
  estado_comprobante text not null,
  fecha_emision date not null,
  fecha_vencimiento date not null,
  mes_declarado text not null,
  serie_comprobante text not null,
  nro_comprobante text not null,
  ruc character varying(11) not null,
  razon_social text not null,
  moneda text not null,
  tipo_cambio numeric(12, 4) null,
  monto numeric(12, 2) not null,
  id_empresa uuid not null,
  id_proyecto uuid null,
  id_usuario uuid not null,
  constraint documentos_tributarios_pkey primary key (id),
  constraint documentos_tributarios_id_empresa_fkey foreign KEY (id_empresa) references empresa (id) on delete CASCADE,
  constraint documentos_tributarios_id_proyecto_fkey foreign KEY (id_proyecto) references proyectos (id) on delete CASCADE,
  constraint documentos_tributarios_id_usuario_fkey foreign KEY (id_usuario) references usuario (id) on delete CASCADE,
  constraint documentos_tributarios_estado_comprobante_check check (
    (
      estado_comprobante = any (
        array[
          'pendiente'::text,
          'devengado'::text,
          'girado'::text,
          'con retencion'::text,
          'pagado'::text,
          'atrasado'::text,
          'anulado'::text,
          'archivado'::text
        ]
      )
    )
  ),
  constraint documentos_tributarios_moneda_check check ((moneda = any (array['PEN'::text, 'USD'::text])))
) TABLESPACE pg_default;
create table public.gastos (
  id uuid not null default extensions.uuid_generate_v4 (),
  tipo text not null,
  categoria text null,
  cantidad numeric(12, 2) not null,
  unidad_medida text not null,
  descripcion text not null,
  precio_unitario numeric(12, 2) not null,
  moneda text not null,
  tipo_cambio numeric(12, 4) null,
  monto_total numeric(14, 2) not null,
  fecha date not null,
  serie_comprobante text null,
  nro_comprobante text null,
  id_empresa uuid not null,
  id_proyecto uuid null,
  id_usuario uuid not null,
  constraint gastos_pkey primary key (id),
  constraint gastos_id_empresa_fkey foreign KEY (id_empresa) references empresa (id) on delete CASCADE,
  constraint gastos_id_proyecto_fkey foreign KEY (id_proyecto) references proyectos (id) on delete CASCADE,
  constraint gastos_id_usuario_fkey foreign KEY (id_usuario) references usuario (id) on delete set null,
  constraint gastos_moneda_check check ((moneda = any (array['PEN'::text, 'USD'::text])))
) TABLESPACE pg_default;

create table public.ingresos (
  id uuid not null default extensions.uuid_generate_v4 (),
  tipo_ingreso text null,
  descripcion text not null,
  moneda text not null,
  tipo_cambio numeric(12, 4) null,
  monto_total numeric(14, 2) not null,
  fecha date not null,
  id_comprobante uuid null,
  id_empresa uuid not null,
  id_proyecto uuid null,
  id_usuario uuid not null,
  estado text null,
  id_usuario_update_data uuid null,
  constraint ingresos_pkey primary key (id),
  constraint ingresos_id_empresa_fkey foreign KEY (id_empresa) references empresa (id) on delete CASCADE,
  constraint ingresos_id_proyecto_fkey foreign KEY (id_proyecto) references proyectos (id) on delete CASCADE,
  constraint ingresos_id_comprobante_fkey foreign KEY (id_comprobante) references documentos_tributarios (id) on delete CASCADE,
  constraint ingresos_id_usuario_update_data_fkey foreign KEY (id_usuario_update_data) references usuario (id),
  constraint ingresos_id_usuario_fkey foreign KEY (id_usuario) references usuario (id) on delete set null,
  constraint ingresos_moneda_check check ((moneda = any (array['PEN'::text, 'USD'::text])))
) TABLESPACE pg_default;
create table public.factura (
  id uuid not null default extensions.uuid_generate_v4 (),
  sujeto_detraccion boolean not null default false,
  porcentaje_detraccion numeric(12, 4) null,
  monto_detraccion numeric(15, 2) null,
  id_comprobante uuid not null,
  id_usuario uuid not null,
  constraint factura_pkey primary key (id),
  constraint factura_id_comprobante_fkey foreign KEY (id_comprobante) references documentos_tributarios (id) on delete CASCADE,
  constraint factura_id_usuario_fkey foreign KEY (id_usuario) references usuario (id) on delete set null
) TABLESPACE pg_default;
create table public.nota_credito (
  id uuid not null default extensions.uuid_generate_v4 (),
  serie_factura_afectada text not null,
  nro_factura_afectada text not null,
  motivo_sustento text null,
  id_comprobante uuid not null,
  id_usuario uuid not null,
  constraint nota_credito_pkey primary key (id),
  constraint nota_credito_id_comprobante_fkey foreign KEY (id_comprobante) references documentos_tributarios (id) on delete CASCADE,
  constraint nota_credito_id_usuario_fkey foreign KEY (id_usuario) references usuario (id) on delete set null
) TABLESPACE pg_default;