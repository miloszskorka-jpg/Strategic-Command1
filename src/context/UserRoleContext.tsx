import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'commander' | 'operations_officer';

interface UserRoleContextValue {
  role:    UserRole;
  setRole: (role: UserRole) => void;
}

const UserRoleContext = createContext<UserRoleContextValue>({
  role:    'commander',
  setRole: () => {},
});

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('commander');
  return (
    <UserRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
