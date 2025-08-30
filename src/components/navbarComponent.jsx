import { Navbar, Container, Nav, NavDropdown, Offcanvas, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { EndSession } from "../services/handleEndSession";

export function NavbarComponent() {
  const navigate = useNavigate()
  const exitApp = async()=>{
    const res = await EndSession()
    if(res.staus === "error"){
      console.log(res.data)
      alert("Error al intentar finalizar la session")
      return null
    }else{
      navigate("/")
    }
  }
  return (
    <>
      <Navbar bg="primary" data-bs-theme="dark" expand={false} className=" mb-3">
        <Container fluid>
          <Navbar.Brand href="#">Mi app</Navbar.Brand>
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
