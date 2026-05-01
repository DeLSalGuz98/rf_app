import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";

//Funciones
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { EndSession } from "../services/handleEndSession";

export const Sidebar = ({isMobile = false }) => {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  const [userName, setUserName] = useState("")
  const [nameCompany, setNameCompany] = useState("")
  const navigate = useNavigate()

  useEffect(()=>{
    GetNames()    
  },[])
  
  const GetNames = async()=>{
    const res = await GetUserNameAndNameCompany()
    setUserName(res.username)
    setNameCompany(res.razonSocial.toUpperCase())
  }

  const exitApp = async()=>{
    const res = await EndSession()
    if(res.staus === "error"){
      console.error(res.data)
      toast.error("Error al intentar finalizar la session")
      return null
    }else{
      navigate("/")
    }
  }

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
        width: "270px",
        height: "100vh",
        position: isMobile ? "relative" : "fixed",
        left: 0,
        top: 0,
        background: "linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)",
        padding: "20px",
      }}
    >
      {/* LOGO / APP */}
      <div className="mb-4">
        <h5 className="fw-bold">{nameCompany}</h5>
        <small className="text-light opacity-75">Sistema Empresarial</small>
      </div>

      {/* MENU */}
      <div className="flex-grow-1 overflow-auto">
        {menu.map((section, i) => (
          <div key={i} className="mb-3">
            <small className="text-uppercase text-light opacity-50">
              {section.section}
            </small>

            <Nav className="flex-column mt-2 gap-1">
              {section.items.map((item, index) => {
                const isActive = location.pathname === item.path;

                return (
                  <Nav.Link
                    key={index}
                    as={Link}
                    to={item.path}
                    onMouseEnter={() => setHovered(item.name)}
                    onMouseLeave={() => setHovered(null)}
                    className="d-flex align-items-center gap-2 text-white"
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: isActive
                        ? "rgba(255,255,255,0.15)"
                        : hovered === item.name
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                      transition: "all 0.2s ease",
                      fontWeight: isActive ? "600" : "400",
                    }}
                  >
                    <i className={`bi ${item.icon}`}></i>
                    {item.name}
                  </Nav.Link>
                );
              })}
            </Nav>
          </div>
        ))}
      </div>

      {/* USER */}
      <div
        className="p-3 rounded-3"
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(5px)",
        }}
      >
        <div className="fw-bold mb-2">{userName}</div>

        <button
          className="btn btn-outline-light w-100"
          onClick={exitApp}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}