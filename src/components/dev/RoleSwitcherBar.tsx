import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Sparkles,
  Building2,
  Home,
  Landmark,
  Server,
} from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, switchRole, availableRoles } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const getRoleIcon = (roleKey: string) => {
    switch (roleKey) {
      case 'super_admin':
        return <Server className="w-4 h-4 text-purple-400" />;
      case 'president':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'treasurer':
        return <Landmark className="w-4 h-4 text-emerald-500" />;
      case 'block_rep':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'resident':
        return <Home className="w-4 h-4 text-indigo-400" />;
      default:
        return <UserCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      id="dev-role-switcher-banner"
      className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs px-4 py-2 transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold tracking-wide uppercase text-[10px]">
            <Sparkles className="w-3 h-3" />
            <span>Simulateur RBAC Multi-Rôles</span>
          </div>
          <span className="hidden sm:inline text-slate-400">
            Basculez entre les 5 profils types pour tester l’isolation des scopes et des vues :
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
            {availableRoles.map((r) => {
              const isActive = currentUser.role === r.role;
              return (
                <button
                  key={r.key}
                  id={`btn-switch-role-${r.key}`}
                  onClick={() => switchRole(r.key)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                  title={`${r.label} — ${r.scopeDescription}`}
                >
                  <span className="hidden md:inline">{getRoleIcon(r.key)}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          <button
            id="btn-toggle-dev-details"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isExpanded ? 'Masquer détails du scope' : 'Afficher détails du scope'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto pt-2 mt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-200 font-medium">Scope actuel :</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {currentUser.role.toUpperCase()}
            </span>
            <span className="text-slate-300">
              {availableRoles.find((r) => r.role === currentUser.role)?.scopeDescription}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Connecté : <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
            </span>
            {currentUser.assignedBlockId && (
              <span className="text-blue-300">
                Bloc rattaché : <strong>Bloc H (Horizon)</strong>
              </span>
            )}
            {currentUser.assignedApartmentId && (
              <span className="text-indigo-300">
                Lot : <strong>Appartement H-12 (1er étage)</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
