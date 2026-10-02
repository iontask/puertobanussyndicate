import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuditLogViewer } from '../audit/AuditLogViewer';
import { Lock, ShieldCheck } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { currentUser } = useAuth();

  // Strict RBAC: Audit log access is reserved for President and Treasurer
  if (currentUser.role !== 'president' && currentUser.role !== 'treasurer') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Accès au Journal d'Audit Réservé
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            La consultation intégrale du Journal d'Audit Immuable de la copropriété Puerto Banus est un privilège d'administration statutaire strictement restreint au <strong>Président du Syndic</strong> et à la <strong>Trésorière Générale</strong>.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sécurité & Intégrité des Registres Actives</span>
          </div>
        </div>
      </div>
    );
  }

  return <AuditLogViewer />;
};
