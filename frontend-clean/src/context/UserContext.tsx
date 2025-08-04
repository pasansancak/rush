import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { fetchUser} from "../api/userFetch";

export type UserType = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  created_at: string;
  profile_image?: string | null;
  gender?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  last_login_at?: string | null;
};

type UserContextType = {
  user: UserType | null;
  setUser: (u: UserType | null) => void;
  refetchUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refetchUser: async () => {},
});

export function UserProvider({ children }) {
  const { jwt, isLoggedIn } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);

  // Güncellenmiş refetchUser
  const refetchUser = async () => {
    if (!jwt) {
      setUser(null);
      return;
    }
    try {
      const userData = await fetchUser(jwt); // Artık userFetch.ts içindeki fonksiyonu çağırıyoruz
      setUser(userData);
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      refetchUser();
    } else {
      setUser(null);
    }
  }, [jwt, isLoggedIn]);

  return (
    <UserContext.Provider value={{ user, setUser, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
