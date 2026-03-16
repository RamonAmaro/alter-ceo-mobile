import React, { createContext, useCallback, useContext, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log("isAuthenticated", isAuthenticated);

  const signIn = useCallback((_email: string, _password: string) => {
    // TODO: replace with real backend authentication
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
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
