import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import LoginPage from "./features/auth/LoginPage";
import TasksPage from "./features/tasks/TasksPage";
import RequireAuth from "./components/RequireAuth";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz → redirect según estado de auth */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />

        {/* Login público */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/tasks"
          element={
            <RequireAuth>
              <TasksPage />
            </RequireAuth>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
