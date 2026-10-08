"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const DEFAULT_STUDENT = {
  id: "STU-2026-081",
  name: "Alex Rivera",
  email: "student@equipx.edu",
  role: "STUDENT",
  department: "Robotics & Autonomous Systems",
  avatar: "AR",
  token: "jwt-demo-student",
};

export const DEFAULT_STAFF = {
  id: "FAC-2026-902",
  name: "Dr. Evelyn Vance",
  email: "staff@equipx.edu",
  role: "STAFF",
  department: "Advanced Materials & Optics Lab",
  avatar: "EV",
  token: "jwt-demo-staff",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from localStorage on initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("equipx_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to student for initial seamless exploration
        setUser(DEFAULT_STUDENT);
        localStorage.setItem("equipx_auth_user", JSON.stringify(DEFAULT_STUDENT));
      }
    } catch (e) {
      setUser(DEFAULT_STUDENT);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (role, email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      setUser(data.user);
      localStorage.setItem("equipx_auth_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginAsDemo = (targetRole) => {
    const demoUser = targetRole === "STAFF" ? DEFAULT_STAFF : DEFAULT_STUDENT;
    setUser(demoUser);
    localStorage.setItem("equipx_auth_user", JSON.stringify(demoUser));
    return demoUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("equipx_auth_user");
  };

  const switchRole = (newRole) => {
    if (newRole === "STAFF") {
      loginAsDemo("STAFF");
    } else {
      loginAsDemo("STUDENT");
    }
  };

  const role = user?.role || "STUDENT";
  const isStaff = role === "STAFF";
  const isStudent = role === "STUDENT";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isStaff,
        isStudent,
        loading,
        login,
        loginAsDemo,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
