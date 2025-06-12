import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Financiero
          </h1>
        </div>
      </div>

      {/* Aquí carga Overview o History */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;