import { Link } from "react-router-dom";

export function LandingPage() {
  return<>
    <div className="vh-100">
      {/* Hero */}
      <section className="bg-primary text-white text-center p-5">
        <div className="container">
          <h1 className="display-4">Bienvenido a Mi Proyecto</h1>
          <p className="lead">Un sistema web diseñado para optimizar la gestión financiera.</p>
          <Link to="/login" className="btn btn-light btn-lg mt-3">
            Iniciar Sesion
          </Link>
        </div>
      </section>

      {/* Características */}
      <section className="container my-5">
        <div className="row text-center">
          <div className="col-md-4">
            <div className="card p-3  h-100 shadow-sm">
              <h3>💻 Fácil de usar</h3>
              <p>Interfaz sencilla y práctica para cualquier usuario.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3  h-100 shadow-sm">
              <h3>📊 Control Financiero</h3>
              <p>Registra ingresos, egresos y mejora la organización.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3  h-100 shadow-sm">
              <h3>☁️ Acceso en la nube</h3>
              <p>Disponible en cualquier lugar y en cualquier momento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 fixed-bottom">
        <p>© {new Date().getFullYear()} Mi Proyecto - Todos los derechos reservados</p>
      </footer>
    </div>
  </>
}