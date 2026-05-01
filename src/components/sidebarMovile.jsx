import { useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { Sidebar } from "./sideBar";

export function SidebarMobile({ userName, exitApp }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* Botón hamburguesa */}
      <div className="d-lg-none p-2">
        <Button variant="primary" onClick={handleShow}>
          ☰ Menú
        </Button>
      </div>

      {/* Sidebar en móvil */}
      <Offcanvas show={show} onHide={handleClose} placement="start">
        
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>Menú</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0">
          <Sidebar 
            userName={userName} 
            exitApp={exitApp} 
            isMobile 
          />
        </Offcanvas.Body>

      </Offcanvas>
    </>
  );
}