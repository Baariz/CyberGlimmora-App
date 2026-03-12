import type { AuthUser, LoginCredentials, UserRole, RolePermissions } from '../types';
import { storage } from '../utils/storage';
import { authUsers } from '../mock-data/auth-users';

interface AuthUserWithPassword extends AuthUser {
  password: string;
}

const users = authUsers as unknown as AuthUserWithPassword[];

const AUTH_KEY = 'cyberglimmora_auth';

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'family':
      return {
        canAccessScamDetection: true,
        canAccessIdentity: true,
        canAccessAssistant: true,
        canAccessRiskScore: true,
        canAccessDevice: true,
        canAccessGuardian: true,
        canAccessJourney: true,
        canAccessSettings: true,
      };
    case 'individual':
    default:
      return {
        canAccessScamDetection: true,
        canAccessIdentity: false,
        canAccessAssistant: true,
        canAccessRiskScore: true,
        canAccessDevice: true,
        canAccessGuardian: false,
        canAccessJourney: false,
        canAccessSettings: true,
      };
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const user = users.find(
    u => u.email === credentials.email && u.password === credentials.password
  );

  if (!user) {
    throw new Error('Invalid email or password. Try: individual@demo.com / demo123');
  }

  const { password, ...authUser } = user;
  const userWithTimestamp = { ...authUser, lastLogin: new Date().toISOString() };

  await storage.set(AUTH_KEY, userWithTimestamp);

  return userWithTimestamp;
}

export async function logout(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  await storage.remove(AUTH_KEY);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return await storage.get<AuthUser>(AUTH_KEY);
}

export function getDemoCredentials(): Array<{ role: UserRole; email: string; password: string; name: string; plan: string }> {
  return [
    { role: 'individual', email: 'individual@demo.com', password: 'demo123', name: 'Arjun Mehta', plan: 'Basic \u00b7 $3.99/mo' },
    { role: 'family', email: 'family@demo.com', password: 'demo123', name: 'Priya Sharma', plan: 'Family \u00b7 $7.99/mo' },
  ];
}
