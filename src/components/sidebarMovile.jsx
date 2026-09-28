import { useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { Sidebar } from "./sideBar";

export function SidebarMobile() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* Barra superior de activación para móvil */}
      <div className="d-lg-none bg-white border-bottom p-2 px-3 d-flex align-items-center justify-content-between sticky-top shadow-sm">
        <span className="fw-bold text-primary">Red Fial</span>
        <Button
          variant="light"
          size="sm"
          className="border d-flex align-items-center gap-2"
          onClick={handleShow}
        >
          <i className="bi bi-list fs-5"></i>
          <span className="fw-medium">Menú</span>
        </Button>
      </div>

      {/* Menú desplegable lateral */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start"
        className="p-0 border-0"
        style={{ width: "280px", background: "transparent" }}
      >
        <Offcanvas.Header
          closeButton
          closeVariant="white"
          style={{
            position: "absolute",
            right: "5px",
            top: "5px",
            zIndex: 1040,
          }}
        />

        <Offcanvas.Body className="p-0">
          <Sidebar isMobile onNavigate={handleClose} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}