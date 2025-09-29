-- Ejemplo para la tabla usuario (igual lógica en todas las tablas)
CREATE POLICY "Solo usuarios autenticados pueden ver" 
ON usuario
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Solo usuarios autenticados pueden insertar"
ON usuario
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden actualizar"
ON usuario
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Solo usuarios autenticados pueden eliminar"
ON usuario
FOR DELETE
TO authenticated
USING (true);
