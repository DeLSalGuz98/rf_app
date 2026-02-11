import { Navbar, Container, Nav, NavDropdown, Offcanvas, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { EndSession } from "../services/handleEndSession";
import { useState } from "react";
import { useEffect } from "react";
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { toast } from "react-toastify";

export function NavbarComponent() {
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
  return (
    <>
      <Navbar bg="primary" data-bs-theme="dark" expand={false} className=" mb-3">
        <Container fluid>
          <Navbar.Brand as={Link} to="/rf/dashboard" className="text-white fw-bold me-3">{nameCompany}</Navbar.Brand>
          <div className="px-3 py-2 rounded-pill shadow-sm fw-bold text-white me-3" 
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
              border: "1px solid rgba(255,255,255,0.2)",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {userName || "Usuario"}
          </div>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                Menu de Opciones
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-between  h-100">
                <div>
                  <Nav.Link as={Link} to="/rf/dashboard">Dashboard Home</Nav.Link>
                  <NavDropdown title="Proyectos" id="offcanvasNavbarDropdown">
                    <NavDropdown.Item as={Link} to="/rf/crear-nuevo-proyecto">Crear nuevo proyecto</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/rf/todos-los-proyectos">Ver todos los Proyectos</NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link as={Link} to="/rf/registrar-gastos">Registrar Gastos</Nav.Link>
                  <NavDropdown title="Documentos Tributarios" id="offcanvasNavbarDropdown">
                    <NavDropdown.Item as={Link} to="/rf/registrar-documentos-tributarios">Registrar Nuevo Documento</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/rf/lista-documentos-tributarios">Ver todos los Documentos</NavDropdown.Item>
                  </NavDropdown>
                  <NavDropdown title="Trabajadores" id="offcanvasNavbarDropdown">
                    <NavDropdown.Item as={Link} to="/rf/registrar-trabajador">Registrar Nuevo Traabajador</NavDropdown.Item>
                  </NavDropdown>
                </div>
                <Button variant="outline-danger" onClick={exitApp}>Cerrar Sesion</Button>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}
