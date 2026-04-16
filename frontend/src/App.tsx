import "./index.css";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { GuestProvider } from "./context/AuthContext";
import { ApiProvider } from "./context/ApiContext";
import { ToastProvider } from "./context/ToastContext";
import { WsProvider } from "./context/WsContext";

export function App() {
  return (
    <GuestProvider>
      <WsProvider>
        <ApiProvider>
          <ToastProvider>
            {useRoutes(routes)}
          </ToastProvider>
        </ApiProvider>
      </WsProvider>
    </GuestProvider>
  );
}

export default App;
