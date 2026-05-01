import { Row, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/sideBar";
import { SidebarMobile } from "../components/sidebarMovile";

export function LayoutNavApp() {
  return (
    <>
      {/* Botón + menú móvil */}
      <SidebarMobile />

      <Row className="g-0">
        
        {/* Sidebar escritorio */}
        <Col lg={2} className="d-none d-lg-block">
          <Sidebar/>
        </Col>

        {/* Contenido */}
        <Col xs={12} lg={10} className="px-4 pt-5">
          <Outlet />
        </Col>

      </Row>
    </>
  );
}