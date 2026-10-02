import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { User, Tenant, Block, Apartment, UserRole } from '../types';
import {
  demoTenant,
  demoUsers,
  demoBlocks,
  demoApartmentsBlockH,
} from '../mock/puertoBanusData';

export type AuthRoleKey = 'super_admin' | 'president' | 'treasurer' | 'block_rep' | 'resident';

interface AuthContextType {
  currentUser: User;
  currentTenant: Tenant;
  tenantsList: Tenant[];
  assignedBlock?: Block;
  assignedApartment?: Apartment;
  switchRole: (roleKey: AuthRoleKey) => void;
  switchTenant: (tenantId: string) => void;
  addTenant: (tenant: Tenant) => void;
  availableRoles: Array<{
    key: AuthRoleKey;
    label: string;
    role: UserRole;
    user: User;
    scopeDescription: string;
  }>;
  hasGlobalAccess: boolean;
  isSuperAdmin: boolean;
  isPresidentScoped: boolean;
  isBlockScoped: boolean;
  isResidentScoped: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Rôle actif par défaut : Président pour débuter avec la vue d'ensemble
  const [activeRoleKey, setActiveRoleKey] = useState<AuthRoleKey>('president');

  // Multi-tenants catalog
  const [tenantsList, setTenantsList] = useState<Tenant[]>([
    demoTenant,
    {
      id: 'tenant-mb-02',
      name: 'Marina Bay Golf & Beach Resort',
      code: 'MARINA-BAY',
      currency: 'MAD',
      createdAt: '2025-11-15T09:00:00Z',
      address: 'Route Côtière Km 12, Cabo Negro',
      city: 'Tétouan / M’diq',
      totalBlocks: 6,
      totalPools: 8,
      totalApartments: 120,
      status: 'active',
      themeColor: '#059669',
    },
  ]);

  const [currentTenantId, setCurrentTenantId] = useState<string>(demoTenant.id);

  const currentTenant = useMemo(() => {
    return tenantsList.find((t) => t.id === currentTenantId) || tenantsList[0] || demoTenant;
  }, [tenantsList, currentTenantId]);

  const superAdminUser: User = useMemo(
    () => ({
      id: 'usr-superadmin',
      tenantId: 'global',
      name: 'Karim Bennani (Éditeur SaaS)',
      email: 'admin@syndikal.cloud',
      role: 'super_admin',
    }),
    []
  );

  const availableRoles = useMemo(() => [
    {
      key: 'president' as const,
      label: 'Président du Conseil',
      role: 'president' as UserRole,
      user: demoUsers.president,
      scopeDescription: 'Vision globale résidence (9 Blocs A-I, 18 piscines, gouvernance)',
    },
    {
      key: 'treasurer' as const,
      label: 'Trésorier Général',
      role: 'treasurer' as UserRole,
      user: demoUsers.treasurer,
      scopeDescription: 'Supervision financière, cotisations, relances & budget',
    },
    {
      key: 'block_rep' as const,
      label: 'Représentant Bloc H',
      role: 'block_rep' as UserRole,
      user: demoUsers.block_rep,
      scopeDescription: 'Scope restreint Bloc H (76 appartements, piscines H, tickets locaux)',
    },
    {
      key: 'resident' as const,
      label: 'Résident H-12',
      role: 'resident' as UserRole,
      user: demoUsers.resident,
      scopeDescription: 'Espace privé copropriétaire (Appt H-12, mes cotisations, signalement)',
    },
    {
      key: 'super_admin' as const,
      label: 'Super-Admin Plateforme',
      role: 'super_admin' as UserRole,
      user: superAdminUser,
      scopeDescription: 'Console SaaS globale : gestion multi-tenants, onboarding & supervision',
    },
  ], [superAdminUser]);

  const currentUser = useMemo(() => {
    if (activeRoleKey === 'super_admin') return superAdminUser;
    return demoUsers[activeRoleKey];
  }, [activeRoleKey, superAdminUser]);

  const assignedBlock = useMemo(() => {
    if (!currentUser.assignedBlockId) return undefined;
    return demoBlocks.find((b) => b.id === currentUser.assignedBlockId);
  }, [currentUser.assignedBlockId]);

  const assignedApartment = useMemo(() => {
    if (!currentUser.assignedApartmentId) return undefined;
    return demoApartmentsBlockH.find((a) => a.id === currentUser.assignedApartmentId);
  }, [currentUser.assignedApartmentId]);

  const switchRole = (roleKey: AuthRoleKey) => {
    setActiveRoleKey(roleKey);
  };

  const switchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
  };

  const addTenant = (newTenant: Tenant) => {
    setTenantsList((prev) => {
      const exists = prev.find((t) => t.id === newTenant.id);
      if (exists) return prev;
      return [...prev, newTenant];
    });
  };

  const isSuperAdmin = currentUser.role === 'super_admin';
  const hasGlobalAccess =
    currentUser.role === 'president' ||
    currentUser.role === 'treasurer' ||
    currentUser.role === 'super_admin';
  const isPresidentScoped = currentUser.role === 'president';
  const isBlockScoped = currentUser.role === 'block_rep';
  const isResidentScoped = currentUser.role === 'resident';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTenant,
        tenantsList,
        assignedBlock,
        assignedApartment,
        switchRole,
        switchTenant,
        addTenant,
        availableRoles,
        hasGlobalAccess,
        isSuperAdmin,
        isPresidentScoped,
        isBlockScoped,
        isResidentScoped,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
};

