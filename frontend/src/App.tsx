import "./index.css";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { AuthProvider } from "./context/AuthContext";

export function App() {
  return (
    <AuthProvider>
      {useRoutes(routes)}
    </AuthProvider>
  );
}

export default App;
