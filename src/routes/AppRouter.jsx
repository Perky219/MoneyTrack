import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Overview from "../pages/dashboard/Overview";
import History from "../pages/dashboard/History";
import PrivateRoute from "./PrivateRoute";
import AddEntry from "../pages/AddEntry";
import EditEntry from "../pages/EditEntry";
import AddIncome from "../pages/AddIncome";
import ImportData from "../pages/ImportData";
import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="overview" element={<Overview />} />
            <Route path="history" element={<History />} />
          </Route>

          {/* Crear nuevo registro */}
          <Route path="/add-entry" element={<AddEntry />} />

          {/* Editar registro */}
          <Route path="/edit-entry/:type/:date" element={<EditEntry />} />

          {/* Agregar ingreso */}
          <Route path="/add-income" element={<AddIncome />} />

          {/* Importar datos y ver perfil */}
          <Route path="/import" element={<ImportData />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
