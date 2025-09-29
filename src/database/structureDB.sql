-- Crear tabla usuario
CREATE TABLE usuario (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    permisos TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Tabla EMPRESA
CREATE TABLE empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruc VARCHAR(11) NOT NULL UNIQUE,
    representante_legal TEXT NOT NULL,
    razon_social TEXT NOT NULL,
    direccion TEXT NOT NULL,
    distrito TEXT NOT NULL,
    provincia TEXT NOT NULL,
    departamento TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla EMPLEADO
CREATE TABLE empleado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    usuario_id UUID UNIQUE REFERENCES usuario(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    email TEXT NOT NULL UNIQUE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    fecha_nacimiento DATE NOT NULL,
    nro_doc TEXT NOT NULL UNIQUE,
    sexo TEXT CHECK (sexo IN ('masculino', 'femenino')),
    telf TEXT,
    tipo_contrata TEXT,
    tipo_doc TEXT,
    tipo_trabajo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

create table proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre_proyecto text not null,
  descripcion_proyecto text,
  direccion text,
  distrito text,
  provincia text,
  departamento text,
  fecha_inicio date not null,
  plazo_dias integer not null,
  fecha_fin date,
  monto_ofertado numeric(15,2),
  tipo text CHECK (tipo IN ('privado', 'orden compra', 'orden servicio')),
  rs_cliente text,
  ruc_cliente varchar(11),
  unidad_ejecutora text,
  exp_siaf text,
  estado text CHECK (estado IN ('pendiente', 'paralizado', 'finalizado')),
  id_empresa uuid references empresa(id) on delete cascade
);
create table gastos (
  id uuid primary key default uuid_generate_v4(),
  cantidad numeric(12,2) not null,
  unidad_medida text not null,
  descripcion text not null,
  tipo text not null,
  precio_unitario numeric(12,2) not null,
  monto_total numeric(14,2) not null,
  moneda text not null,
  tipo_cambio numeric(12,4),
  fecha date not null,
  serie_comprobante text,
  nro_comprobante text,
  categoria text,
  id_empresa uuid not null references empresa(id) on DELETE CASCADE,
  id_proyecto uuid references proyectos(id) on DELETE CASCADE,
  id_usuario uuid not null references usuario(id) on DELETE SET NULL,
  created_at timestamp with time zone default now()
);

create table documentos_tributarios (
  id uuid primary key default gen_random_uuid(),

  estado_comprobante text not null check (
    estado_comprobante in ('pendiente', 'pagado', 'atrasado', 'anulado', 'archivado')
  ),

  fecha_emision date not null,
  fecha_vencimiento date not null,
  mes_declarado text not null, -- ejemplo: "2025-09"

  moneda text not null check (moneda in ('PEN', 'USD', 'EUR')),
  monto numeric(12,2) not null,

  nro_comprobante text not null,
  razon_social text not null,
  ruc varchar(11) not null,

  serie_comprobante text not null,
  tipo_cambio numeric(12,4),
  tipo_doc text not null,

  id_empresa uuid not null references public.empresa(id) on delete cascade,
  id_usuario uuid not null references public.usuario(id) on delete cascade,

  created_at timestamp with time zone default now()
);