✅ Tareas Sprint 1
🔹 Configuración inicial

 Configurar la conexión con Supabase (supabaseClient.js).✅

 Crear archivo .env para guardar las credenciales de Supabase.✅

 Verificar la conexión con un test simple en consola.✅

🔹 Rutas principales

 Crear layout base con react-router-dom.✅

 Definir rutas iniciales:

/ → Landing Page✅

/login → Formulario de inicio de sesión✅

/register → Formulario de registro

/dashboard → Vista protegida (sólo accesible si estás logueado).

🔹 Autenticación

 Crear formulario de Registro con react-hook-form + zod.

 Integrar Supabase para registrar usuarios (supabase.auth.signUp).

 Crear formulario de Login con react-hook-form + zod.

 Integrar Supabase para iniciar sesión (supabase.auth.signInWithPassword).

 Implementar Logout (supabase.auth.signOut).

 Manejar errores de login/registro y mostrar mensajes con react-bootstrap (Alerts).

🔹 Protección de rutas

 Crear un componente PrivateRoute que verifique si el usuario está autenticado.

 Redirigir a /login si el usuario no está autenticado.

🔹 UI mínima

 Crear un Navbar simple con Bootstrap que muestre:

Nombre de la app.

Botón de login / logout según estado.

 Estilos básicos de bootstrap para formularios.