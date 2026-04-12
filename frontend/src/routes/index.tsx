import { type RouteObject } from "react-router-dom";
import { Header } from "../components/home/Header";
import { Footer } from "../components/home/Footer";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { RoomsPage } from "../pages/RoomsPage";
import { RoomPage } from "../pages/RoomPage";
import { NotFoundPage } from "../pages/NotFoundPage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: "/auth/login",
    element: <Layout><LoginPage /></Layout>,
  },
  {
    path: "/auth/register",
    element: <Layout><RegisterPage /></Layout>,
  },
  {
    path: "/rooms",
    element: <Layout><RoomsPage /></Layout>,
  },
  {
    path: "/rooms/:id",
    element: <Layout><RoomPage /></Layout>,
  },
  {
    path: "*",
    element: <Layout><NotFoundPage /></Layout>,
  },
];
