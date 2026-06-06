"use client";
import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { data: session } = useSession();

  const user = useMemo(() => {
    if (session?.user) {
      return {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      };
    }
    return null;
  }, [session]);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
