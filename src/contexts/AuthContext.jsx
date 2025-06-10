import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, comprobamos sesión vía cookie HTTP-only
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/profile`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Login: form-urlencoded porque usamos OAuth2PasswordRequestForm
  const login = async (email, password) => {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
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

  // Registro: JSON normal
  const register = async (payload) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error en registro");
    }
  };

  // Logout: limpiar cookie en backend
  const logout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
