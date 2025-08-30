import { Container } from "react-bootstrap";
import { NavbarComponent } from "../components/navbarComponent";
import { Outlet } from "react-router-dom";

export function LayoutNavApp(){
  return<>
    <NavbarComponent/>
    <Outlet/>
  </>
}