import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Funciones
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { EndSession } from "../services/handleEndSession";

export const Sidebar = ({ isMobile = false, onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [hovered, setHovered] = useState(null);
  const [userName, setUserName] = useState("");
  const [nameCompany, setNameCompany] = useState("");

  useEffect(() => {
    GetNames();
  }, []);

  const GetNames = async () => {
    try {
      const res = await GetUserNameAndNameCompany();
      if (res) {
        setUserName(res.username || "Usuario");
        setNameCompany(res.razonSocial ? res.razonSocial.toUpperCase() : "EMPRESA");
      }
    } catch (error) {
      console.error("Error al obtener datos de empresa/usuario:", error);
    }
  };

  const exitApp = async () => {
    const res = await EndSession();
    if (res?.staus === "error") {
      console.error(res.data);
      toast.error("Error al intentar finalizar la sesión");
    } else {
      if (onNavigate) onNavigate();
      navigate("/");
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  const menu = [
    {
      section: "GENERAL",
      items: [
        { name: "Dashboard", path: "/rf/dashboard", icon: "bi-speedometer2" },
      ],
    },
    {
      section: "PROYECTOS",
      items: [
        { name: "Crear Proyecto", path: "/rf/crear-nuevo-proyecto", icon: "bi-plus-circle" },
        { name: "Ver Proyectos", path: "/rf/todos-los-proyectos", icon: "bi-folder" },
      ],
    },
    {
      section: "FINANZAS",
      items: [
        { name: "Gastos", path: "/rf/registrar-gastos", icon: "bi-cash-stack" },
        { name: "Cuentas por cobrar", path: "/rf/cuentas-por-cobrar", icon: "bi-file-earmark-arrow-down" },
      ],
    },
    {
      section: "DOCUMENTOS",
      items: [
        { name: "Registrar", path: "/rf/registrar-documentos-tributarios", icon: "bi-file-earmark-plus" },
        { name: "Ver Todos", path: "/rf/lista-documentos-tributarios", icon: "bi-file-earmark-text" },
      ],
    },
    {
      section: "TRABAJADORES",
      items: [
        { name: "Registrar", path: "/rf/registrar-trabajador", icon: "bi-person-plus" },
        { name: "Lista Trabajadores", path: "/rf/lista-trabajadores-empresa", icon: "bi-person-lines-fill" },
      ],
    },
    {
      section: "OTROS",
      items: [
        { name: "Precios", path: "/rf/consultar-precios", icon: "bi-tag" },
      ],
    },
  ];

  return (
    <div
      className={`${!isMobile ? "d-none d-lg-flex" : "d-flex w-100"} flex-column text-white`}
      style={{
        width: isMobile ? "100%" : "270px",
        height: "100vh",
        position: isMobile ? "relative" : "fixed",
        left: 0,
        top: 0,
        background: "linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)",
        padding: "20px",
        zIndex: 1030,
      }}
    >
      {/* LOGO / APP */}
      <div className="mb-4 pb-2 border-bottom border-white border-opacity-10">
        <h5 className="fw-bold mb-1 text-truncate" title={nameCompany}>
          {nameCompany || "CARGANDO..."}
        </h5>
        <small className="text-light opacity-75 d-block">Sistema Empresarial</small>
      </div>

      {/* MENU */}
      <div className="flex-grow-1 overflow-auto pe-1">
        {menu.map((section, i) => (
          <div key={i} className="mb-3">
            <small
              className="text-uppercase text-light opacity-50 fw-semibold d-block mb-1"
              style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
            >
              {section.section}
            </small>

            <Nav className="flex-column gap-1">
              {section.items.map((item, index) => {
                const isActive = location.pathname === item.path;

                return (
                  <Nav.Link
                    key={index}
                    as={Link}
                    to={item.path}
                    onClick={handleLinkClick}
                    onMouseEnter={() => setHovered(item.name)}
                    onMouseLeave={() => setHovered(null)}
                    className="d-flex align-items-center gap-2 text-white"
                    style={{
                      padding: "9px 12px",
                      borderRadius: "8px",
                      background: isActive
                        ? "rgba(255, 255, 255, 0.2)"
                        : hovered === item.name
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                      transition: "all 0.2s ease-in-out",
                      fontWeight: isActive ? "600" : "400",
                      fontSize: "0.92rem",
                    }}
                  >
                    <i className={`bi ${item.icon} fs-5`}></i>
                    <span>{item.name}</span>
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>
        ))}
      </div>

      {/* USER & LOGOUT */}
      <div
        className="p-3 rounded-3 mt-3 border border-white border-opacity-10"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-2">
          <div
            className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold"
            style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}
          >
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="fw-semibold text-truncate small" style={{ maxWidth: "170px" }}>
            {userName || "Cargando..."}
          </div>
        </div>

        <button
          className="btn btn-sm btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={exitApp}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};