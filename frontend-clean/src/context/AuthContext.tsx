import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

type AuthContextType = {
  isLoggedIn: boolean;
  jwt: string | null;
  login: (jwt: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  jwt: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    // App açıldığında SecureStore'dan token oku
    (async () => {
      const storedJwt = await SecureStore.getItemAsync("jwt");
      if (storedJwt) setJwt(storedJwt);
    })();
  }, []);

  const login = async (token: string) => {
    await SecureStore.setItemAsync("jwt", token);
    setJwt(token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("jwt");
    setJwt(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!jwt, jwt, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook olarak kullanmak için
export const useAuth = () => useContext(AuthContext);
