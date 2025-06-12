import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: user?.email || "",
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    spendingGoal: "0",
    savingGoal: "0",
    investmentGoal: "0",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const types = ["expense", "saving", "investment"];
        const goalsPromises = types.map(async (type) => {
          const res = await fetch(`${API_URL}/goals?goal_type=${type}`, {
            credentials: "include",
          });
          if (!res.ok) return null;
          const list = await res.json();
          return list.length
            ? list.sort((a, b) => new Date(b.date) - new Date(a.date))[0].value
            : "0";
        });
        const [expense, saving, investment] = await Promise.all(goalsPromises);

        setFormData({
          ...formData,
          spendingGoal: expense,
          savingGoal: saving,
          investmentGoal: investment,
        });
      } catch (error) {
        console.error(error);
        setError("Error cargando los datos");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const validateForm = () => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("El correo electrónico no es válido");
      return false;
    }

    // Validar username
    if (formData.username && formData.username.length > 50) {
      setError("El nombre de usuario no puede exceder 50 caracteres");
      return false;
    }

    // Validar nueva contraseña si se proporciona
    if (formData.newPassword) {
      if (formData.newPassword.length < 10) {
        setError("La nueva contraseña debe tener al menos 10 caracteres");
        return false;
      }

      const passwordRegex =
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(formData.newPassword)) {
        setError(
          "La nueva contraseña debe incluir letras, números y al menos 1 símbolo"
        );
        return false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return false;
      }

      if (!formData.currentPassword) {
        setError("Debes proporcionar tu contraseña actual para cambiarla");
        return false;
      }
    }

    // Validar metas financieras
    const spending = parseFloat(formData.spendingGoal) || 0;
    const saving = parseFloat(formData.savingGoal) || 0;
    const investment = parseFloat(formData.investmentGoal) || 0;

    if (spending + saving + investment > 100) {
      setError("La suma de las metas financieras no puede exceder el 100%");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // 1) PUT /profile
      const updatePayload = {};
      if (formData.email !== user.email) updatePayload.email = formData.email;
      if (formData.username !== user.username)
        updatePayload.username = formData.username;
      if (formData.newPassword) updatePayload.password = formData.newPassword;

      if (Object.keys(updatePayload).length) {
        const res = await fetch(`${API_URL}/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Error al actualizar perfil");
        }
      }

      // 2) POST metas
      const today = new Date().toISOString().split("T")[0];
      const goalTypes = [
        { key: "spendingGoal", type: "expense" },
        { key: "savingGoal", type: "saving" },
        { key: "investmentGoal", type: "investment" },
      ];
      await Promise.all(
        goalTypes.map(async ({ key, type }) => {
          const val = parseFloat(formData[key]);
          if (val >= 0.1) {
            // Si es >= 0.1: crear o actualizar
            const res = await fetch(`${API_URL}/goals/${type}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ date: today, value: val }),
            });
            if (!res.ok) throw new Error(`Error guardando meta ${type}`);
          } else {
            // Si es 0: eliminarla
            const res = await fetch(`${API_URL}/goals/${type}`, {
              method: "DELETE",
              credentials: "include",
            });
            if (!res.ok) throw new Error(`Error borrando meta ${type}`);
          }
        })
      );

      setSuccess("Perfil y metas actualizadas correctamente");

      // Si cambió email o contraseña ➝ logout
      if (formData.email !== user.email || formData.newPassword) {
        setTimeout(async () => {
          await logout();
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información personal */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información Personal
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo Electrónico *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  maxLength="50"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Opcional - máximo 50 caracteres"
                />
              </div>
            </div>
          </div>

          {/* Cambio de contraseña */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cambiar Contraseña
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña Actual
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Solo si deseas cambiar la contraseña"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nueva Contraseña
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 10 caracteres con letras, números y símbolos"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar Nueva Contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Metas financieras */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Metas Financieras Mensuales
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Establece tus metas como porcentaje de tu ingreso mensual. La suma
              no puede exceder 100%.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="spendingGoal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Meta de Gasto (%) *
                </label>
                <input
                  id="spendingGoal"
                  name="spendingGoal"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={formData.spendingGoal}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="savingGoal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Meta de Ahorro (%) *
                </label>
                <input
                  id="savingGoal"
                  name="savingGoal"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={formData.savingGoal}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="investmentGoal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Meta de Inversión (%) *
                </label>
                <input
                  id="investmentGoal"
                  name="investmentGoal"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={formData.investmentGoal}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              Total:{" "}
              {(Number.parseFloat(formData.spendingGoal) || 0) +
                (Number.parseFloat(formData.savingGoal) || 0) +
                (Number.parseFloat(formData.investmentGoal) || 0)}
              %
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
