import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

// Demo users
const USERS = {
  "student@eventora.com": {
    id: "1",
    name: "Alex Johnson",
    email: "student@eventora.com",
    role: "student",
    password: "password",
  },

  "coordinator@eventora.com": {
    id: "2",
    name: "Sarah Williams",
    email: "coordinator@eventora.com",
    role: "coordinator",
    password: "password",
  },

  "admin@eventora.com": {
    id: "3",
    name: "Mike Chen",
    email: "admin@eventora.com",
    role: "admin",
    password: "password",
  },
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("eventora_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback((email, password) => {

    const foundUser = USERS[email];

    if (!foundUser || foundUser.password !== password) {
      throw new Error("Invalid email or password");
    }

    const { password: removed, ...userData } = foundUser;

    setUser(userData);
    localStorage.setItem("eventora_user", JSON.stringify(userData));

  }, []);

  const register = useCallback((name, email, password, role) => {

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
    };

    setUser(newUser);
    localStorage.setItem("eventora_user", JSON.stringify(newUser));

  }, []);

  const logout = useCallback(() => {

    setUser(null);
    localStorage.removeItem("eventora_user");

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};