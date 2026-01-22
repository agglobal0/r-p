import React, { createContext, useContext, useEffect, useState } from "react";
import {
  login as loginApi,
  register as registerApi,
  verifyOTP as verifyOTPApi,
  logout as logoutApi,
  getCurrentUser,
} from "../services/authService";

// Create a context to hold authentication state and helper functions
const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, attempt to fetch the current user (session check)
  useEffect(() => {
    const fetchUser = async () => {
      const current = await getCurrentUser();
      setUser(current);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const loggedUser = await getCurrentUser();
    setUser(loggedUser);
    return res;
  };

  const register = async (username, email, password) => {
    const res = await registerApi(username, email, password);
    // Registration does not log in automatically; user will verify OTP next step
    return res;
  };

  const verifyOTP = async (email, otp) => {
    const res = await verifyOTPApi(email, otp);
    const loggedUser = await getCurrentUser();
    setUser(loggedUser);
    return res;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOTP,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
