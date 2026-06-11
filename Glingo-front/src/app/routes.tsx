import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Classes from "./pages/Classes";
import Confirmation from "./pages/Confirmation";
import Support from "./pages/Support";
import Admin from "./pages/Admin";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "cadastro", Component: Register },
      { path: "login", Component: Login },
      { path: "turmas", Component: Classes },
      { path: "confirmacao", Component: Confirmation },
      { path: "atendimento", Component: Support },
    ],
  },
  {
    path: "/admin",
    Component: Admin,
  },
]);
