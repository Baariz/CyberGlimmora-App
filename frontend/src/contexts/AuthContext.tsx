import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, RolePermissions } from '../types';
import { storage } from '../utils/storage';

const AUTH_USERS = [
  {
    id: 'usr_001',
    name: 'Arjun Mehta',
    email: 'individual@demo.com',
    phone: '+91 98765 43210',
    avatar: '',
    role: 'individual' as const,
    plan: 'basic' as const,
    joinedDate: '2025-08-15',
    devicesCount: 4,
    familyMembers: 0,
    twoFactorEnabled: true,
    lastLogin: new Date().toISOString(),
    password: 'demo123',
  },
  {
    id: 'usr_002',
    name: 'Priya Sharma',
    email: 'family@demo.com',
    phone: '+91 87654 32109',
    avatar: '',
    role: 'family' as const,
    plan: 'family' as const,
    joinedDate: '2025-06-20',
    devicesCount: 6,
    familyMembers: 3,
    twoFactorEnabled: true,
    lastLogin: new Date().toISOString(),
    password: 'demo123',
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: RolePermissions;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (key: keyof RolePermissions) => boolean;
}

const defaultPermissions: RolePermissions = {
  canAccessScamDetection: false,
  canAccessIdentity: false,
  canAccessAssistant: false,
  canAccessRiskScore: false,
  canAccessDevice: false,
  canAccessGuardian: false,
  canAccessJourney: false,
  canAccessSettings: false,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: defaultPermissions,
  login: async () => {},
  logout: async () => {},
  hasPermission: () => false,
});

function getRolePermissions(role: 'individual' | 'family'): RolePermissions {
  const base = {
    canAccessScamDetection: true,
    canAccessIdentity: true,
    canAccessAssistant: true,
    canAccessRiskScore: true,
    canAccessDevice: true,
    canAccessSettings: true,
    canAccessGuardian: role === 'family',
    canAccessJourney: true,
  };
  return base;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions>(defaultPermissions);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const stored = await storage.get<AuthUser>('auth_user');
    if (stored) {
      setUser(stored);
      setPermissions(getRolePermissions(stored.role));
    }
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    setError(null);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const found = AUTH_USERS.find((u) => u.email === email && u.password === password);
    if (!found) {
      setError('Invalid email or password');
      setIsLoading(false);
      return;
    }

    const { password: _, ...authUser } = found;
    authUser.lastLogin = new Date().toISOString();
    await storage.set('auth_user', authUser);
    setUser(authUser as AuthUser);
    setPermissions(getRolePermissions(authUser.role));
    setIsLoading(false);
  }

  async function logout() {
    await storage.remove('auth_user');
    setUser(null);
    setPermissions(defaultPermissions);
  }

  function hasPermission(key: keyof RolePermissions) {
    return permissions[key];
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        permissions,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
