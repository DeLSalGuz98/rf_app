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
        <Col lg={3} className="d-none d-lg-block">
          <Sidebar/>
        </Col>

        {/* Contenido */}
        <Col xs={12} lg={9} className="p-3">
          <Outlet />
        </Col>

      </Row>
    </>
  );
}

// import { Container, Row, Col } from "react-bootstrap";
// import { NavbarComponent } from "../components/navbarComponent";
// import { Outlet } from "react-router-dom";

// import {Sidebar} from "../components/sideBar"

// export function LayoutNavApp(){
//   return<>
//     {/* <NavbarComponent/> */}
//     <Row className="w-100">
//       <Col className="position-relative top-0" md="3">
//         <Sidebar></Sidebar>
//       </Col>
//       <Col className="" md="9">
//         <Outlet/>
//       </Col>
//     </Row>
//   </>
// }