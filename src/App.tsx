import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Conversas from "./pages/Conversas";
import KanbanPage from "./pages/Kanban";
import Metricas from "./pages/Metricas";
import Agenda from "./pages/Agenda";
import Login from "./pages/Login";
import { useAuth } from "./hooks/use-auth";

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/conversas" element={<Conversas />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/metricas" element={<Metricas />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
