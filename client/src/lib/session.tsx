'use client';

import React, { createContext, useContext } from 'react';

export type User = {
  name: string;
  email: string;
  role: string;
  picture?: string;
  token?: string;
  id?: string;
  instituteId?: string | null;
};

const UserContext = createContext<User | null>(null);

export const UserProvider = ({ user, children }: { user: User | null; children: React.ReactNode }) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

export default UserContext;
