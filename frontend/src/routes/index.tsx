import { type RouteObject } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
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
    path: "*",
    element: <Layout><NotFoundPage /></Layout>,
  },
];
