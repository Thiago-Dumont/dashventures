import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Conversas from "./pages/Conversas";
import KanbanPage from "./pages/Kanban";
import Metricas from "./pages/Metricas";
import Agenda from "./pages/Agenda";

export default function App() {
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
