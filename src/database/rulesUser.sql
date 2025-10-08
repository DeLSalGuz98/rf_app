alter table usuario enable row level security;
alter table empresa enable row level security;
alter table empleado enable row level security;
alter table proyectos enable row level security;
alter table documentos_tributarios enable row level security;
alter table gastos enable row level security;
alter table ingresos enable row level security;
-- Permitir creación sin autenticación (registro inicial)
create policy "Permitir registro inicial de usuario"
on public.usuario
for insert
to public
using (true)
with check (true);

-- Acceso autenticado a su propio usuario
create policy "Usuario puede ver su propio registro"
on public.usuario
for select
to authenticated
using (id = auth.uid());

create policy "Usuario puede actualizar su propio registro"
on public.usuario
for update
to authenticated
using (id = auth.uid());

create policy "Usuario puede eliminar su propio registro"
on public.usuario
for delete
to authenticated
using (id = auth.uid());
-- Registro inicial sin autenticación
create policy "Permitir registro inicial de empresa"
on public.empresa
for insert
to public
using (true)
with check (true);

-- Solo usuarios autenticados pueden ver, modificar o eliminar su empresa
create policy "Acceso a la empresa del usuario"
on public.empresa
for all
to authenticated
using (
  id in (
    select empresa_id from public.empleado where usuario_id = auth.uid()
  )
);
-- Permitir registro inicial sin autenticación
create policy "Permitir registro inicial de empleado"
on public.empleado
for insert
to public
using (true)
with check (true);

-- Solo empleados autenticados de la misma empresa
create policy "Acceso para empleados de la misma empresa"
on public.empleado
for all
to authenticated
using (
  empresa_id in (
    select empresa_id from public.empleado where usuario_id = auth.uid()
  )
);
create policy "Acceso total a proyectos de su empresa"
on public.proyectos
for all
to authenticated
using (
  id_empresa in (
    select empresa_id from public.empleado where usuario_id = auth.uid()
  )
);
create policy "Acceso a documentos tributarios de su empresa"
on public.documentos_tributarios
for all
to authenticated
using (
  id_empresa in (
    select empresa_id from public.empleado where usuario_id = auth.uid()
  )
)
create policy "Acceso a gastos de su empresa"
on public.gastos
for all
to authenticated
using (
  id_empresa in (
    select empresa_id from public.empleado where usuario_id = auth.uid()
  )
);
create policy "Acceso a ingresos de su empresa"
on public.ingresos
for all
to authenticated
using (
  id_empresa in (
    select empresa_id from public.empleado where usuario_id = auth.uid()
  )
);