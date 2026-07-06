import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetTasksQuery, useDeleteTaskMutation, useUpdateTaskMutation } from "./tasksApi";
import TaskForm from "./TaskForm";
import type { TaskResponse, TaskStatus } from "@repo/shared";
import { useLogoutMutation } from "../auth/authApi";
import { logout } from "../auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-700" },
  IN_PROGRESS: { label: "En progreso", color: "bg-blue-100 text-blue-700" },
  DONE: { label: "Completada", color: "bg-green-100 text-green-700" },
};

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const { data: tasks, isLoading, isError } = useGetTasksQuery();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [logoutMutation] = useLogoutMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    setDeletingId(id);
    try {
      await deleteTask(id).unwrap();
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (task: TaskResponse) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const handleQuickStatus = async (task: TaskResponse) => {
    const next: Record<TaskStatus, TaskStatus> = {
      PENDING: "IN_PROGRESS",
      IN_PROGRESS: "DONE",
      DONE: "PENDING",
    };
    await updateTask({ id: task.id, status: next[task.status] }).unwrap();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Task Manager</h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mis tareas</h2>
            {tasks && (
              <p className="text-sm text-gray-500 mt-0.5">
                {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                       px-4 py-2.5 rounded-lg transition focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:ring-offset-2"
          >
            + Nueva tarea
          </button>
        </div>

        {/* States */}
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando tareas...</div>
        )}

        {isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700 text-center">
            Error al cargar tareas. Intenta recargar la página.
          </div>
        )}

        {/* Task list */}
        {tasks && tasks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No tienes tareas todavía.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-blue-600 hover:underline text-sm font-medium"
            >
              Crear la primera
            </button>
          </div>
        )}

        {tasks && tasks.length > 0 && (
          <ul className="space-y-3">
            {tasks.map((task) => {
              const cfg = STATUS_CONFIG[task.status];
              return (
                <li
                  key={task.id}
                  className="bg-white rounded-xl border border-gray-200 px-5 py-4
                             hover:border-gray-300 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Status badge (clickeable para ciclar) */}
                    <button
                      onClick={() => handleQuickStatus(task)}
                      title="Cambiar estado"
                      className={`mt-0.5 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full
                                  cursor-pointer transition hover:opacity-80 ${cfg.color}`}
                    >
                      {cfg.label}
                    </button>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(task.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium
                                   px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        disabled={isDeleting && deletingId === task.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium
                                   px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition
                                   disabled:opacity-50"
                      >
                        {isDeleting && deletingId === task.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Modal */}
      {showForm && (
        <TaskForm task={editingTask} onClose={handleCloseForm} />
      )}
    </div>
  );
}
