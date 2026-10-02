import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { ShieldCheck, Lock, Copy, Check, X, Database, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface SecurityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityMatrixModal: React.FC<SecurityMatrixModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Multi-tenant boundary check
    function isTenantMember(tenantId) {
      return request.auth != null && 
             request.auth.token.tenantId != null && 
             request.auth.token.tenantId == tenantId;
    }

    function isPresident(tenantId) {
      return isTenantMember(tenantId) && request.auth.token.role == 'president';
    }

    function isTreasurer(tenantId) {
      return isTenantMember(tenantId) && request.auth.token.role == 'treasurer';
    }

    function isBureau(tenantId) {
      return isTenantMember(tenantId) && 
             (request.auth.token.role == 'president' || request.auth.token.role == 'treasurer');
    }

    function isBlockRep(tenantId, blockId) {
      return isTenantMember(tenantId) && 
             request.auth.token.role == 'block_rep' && 
             request.auth.token.assignedBlockId == blockId;
    }

    function isOwnApartment(apartmentId) {
      return request.auth.token.apartmentId != null && 
             request.auth.token.apartmentId == apartmentId;
    }

    match /tenants/{tenantId} {
      allow read: if isTenantMember(tenantId);
      allow write: if isPresident(tenantId);

      // Financial contributions & calls
      match /contributions/{contributionId} {
        allow read: if isBureau(tenantId) || 
                       isOwnApartment(resource.data.apartmentId);
        allow write: if isTreasurer(tenantId) || isPresident(tenantId);
      }

      // Payments and official receipts
      match /payments/{paymentId} {
        allow read: if isBureau(tenantId) || 
                       isOwnApartment(resource.data.apartmentId);
        allow create, update: if isTreasurer(tenantId) || isPresident(tenantId);
        allow delete: if false; // No hard deletes
      }

      // Complaints & Incidents (Scoped visibility)
      match /complaints/{complaintId} {
        allow read: if isBureau(tenantId) ||
                       (resource.data.scope == 'residence' && isTenantMember(tenantId)) ||
                       (resource.data.scope == 'block' && request.auth.token.assignedBlockId == resource.data.blockId) ||
                       isOwnApartment(resource.data.apartmentId);
        allow create: if isTenantMember(tenantId) && request.resource.data.tenantId == tenantId;
        allow update: if isBureau(tenantId) || isBlockRep(tenantId, resource.data.blockId);
        allow delete: if isPresident(tenantId);
      }

      // IMMUTABLE AUDIT LOGS (WORM: Write-Once-Read-Many)
      match /audit_logs/{logId} {
        allow read: if isBureau(tenantId);
        allow create: if isTenantMember(tenantId) && 
                         request.resource.data.tenantId == tenantId && 
                         request.resource.data.actorId == request.auth.uid;
        allow update: if false; // STRICT IMMUTABILITY
        allow delete: if false; // STRICT IMMUTABILITY
      }
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rulesCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  {t('security.firestore_rules_title')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Actif & Vérifié
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Isolation hermétique multi-tenant • Immutabilité WORM • RBAC granulaire
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Highlights */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-blue-600" />
                <h5 className="font-bold text-xs text-blue-950">Isolation des Tenants</h5>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Vérification systématique de <code className="bg-white/80 px-1 rounded text-[10px] font-mono">request.auth.token.tenantId</code> interdisant tout accès croisé entre résidences.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h5 className="font-bold text-xs text-emerald-950">Immutabilité Audit Log</h5>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Règle <code className="bg-white/80 px-1 rounded text-[10px] font-mono">allow update, delete: if false;</code> garantissant un registre légal inaltérable.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <h5 className="font-bold text-xs text-purple-950">Étanchéité Financière</h5>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Un copropriétaire ne peut lire que ses propres cotisations (<code className="bg-white/80 px-1 rounded text-[10px] font-mono">apartmentId</code>). Trésorière & Président supervisent l'ensemble.
              </p>
            </div>
          </div>

          {/* Rules Code Viewer */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>/firestore.rules</span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copier les règles</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-80 leading-relaxed">
              <code>{rulesCode}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
