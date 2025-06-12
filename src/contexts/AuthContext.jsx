import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/profile`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          // No autenticado: simplemente limpiamos usuario
          setUser(null);
          return null;
        }
        if (res.status === 404) {
          throw new Error("Perfil no encontrado");
        }
        if (!res.ok) {
          // Otros errores de red
          throw new Error("Error al comprobar sesión");
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch((err) => {
        // Solo loguea errores “verdaderos”
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login con OAuth2PasswordRequestForm
  const login = async (email, password) => {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error en login");
    }

    const data = await res.json();
    setUser(data.user);
  };

  // Registro
  const register = async (payload) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error en registro");
    }
  };

  // Logout
  const logout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
