import "./index.css";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ApiProvider } from "./context/ApiContext";
import { ToastProvider } from "./context/ToastContext";
import { WsProvider } from "./context/WsContext";

export function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <ToastProvider>
          <WsProvider>
            {useRoutes(routes)}
          </WsProvider>
        </ToastProvider>
      </ApiProvider>
    </AuthProvider>
  );
}

export default App;
