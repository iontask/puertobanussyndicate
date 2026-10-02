import React from 'react';
import { Pool, CommonLightingItem, ServicePassageLog, Tenant, Block } from '../../types';
import { useI18n } from '../../i18n/I18nContext';
import { Printer, Download, X, CheckCircle, AlertTriangle, Sparkles, Wrench } from 'lucide-react';
import { downloadCSV } from '../../utils/exportHelpers';

interface PrintableMaintenanceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  blocks: Block[];
  pools: Pool[];
  commonLighting: CommonLightingItem[];
  servicePassages: ServicePassageLog[];
}

export const PrintableMaintenanceSheet: React.FC<PrintableMaintenanceSheetProps> = ({
  isOpen,
  onClose,
  tenant,
  blocks,
  pools,
  commonLighting,
  servicePassages,
}) => {
  const { t, isRTL } = useI18n();

  if (!isOpen) return null;

  const totalPools = pools.length;
  const operationalPools = pools.filter((p) => p.status === 'operational').length;
  const defectivePoolLights = pools.filter((p) => p.lightingStatus === 'defective').length;

  const totalLightingItems = commonLighting.length;
  const defectiveLightingItems = commonLighting.filter((l) => l.status === 'defective').length;

  // Passages compliance
  const validatedPassages = servicePassages.filter((p) => p.isBureauValidated).length;
  const serviceComplianceRate = servicePassages.length > 0 
    ? Math.round((validatedPassages / servicePassages.length) * 100) 
    : 100;

  const handleExportCSV = () => {
    const headers = [
      'Bassin ID',
      'Bloc',
      'Type Bassin',
      'Statut Baignade',
      'Température (°C)',
      'Indice pH',
      'Chlore (ppm)',
      'Projecteurs Immergés',
      'Dernier Entretien',
    ];

    const rows = pools.map((p) => [
      p.id,
      p.blockCode,
      p.type === 'adult' ? 'Grand Bassin Adulte' : 'Pataugeoire Enfant',
      p.status === 'operational' ? 'Baignade Ouverte' : p.status === 'maintenance' ? 'En maintenance' : 'Fermé',
      p.waterTemperatureC,
      p.phLevel,
      p.chlorinePpm,
      p.lightingStatus === 'working' ? 'Opérationnel' : 'Défectueux',
      p.lastCleanedAt ? new Date(p.lastCleanedAt).toLocaleDateString('fr-FR') : 'N/A',
    ]);

    downloadCSV(`Bilan_Maintenance_Bassins_${tenant.code}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Action Bar (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
              TECH
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">
                {t('reports.monthly_tech')}
              </h3>
              <p className="text-xs text-slate-400">
                18 Bassins • Éclairage • Services Techniques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('common.print')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-900 bg-white" id="printable-maintenance-sheet">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-widest uppercase bg-cyan-900 text-white">
                  Contrôle Technique & Sanitaire
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Résidence {tenant.name}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('reports.monthly_tech')}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Audit mensuel des 18 bassins privatifs, des éclairages des paliers et des prestataires.
              </p>
            </div>

            <div className={`text-right sm:${isRTL ? 'text-left' : 'text-right'}`}>
              <div className="text-xs text-slate-500">
                Date d’inspection : <span className="font-semibold text-slate-800">{currentDateFormatted}</span>
              </div>
              <div className="text-xs text-slate-500">
                Périodicité : <span className="font-semibold text-slate-800">Mensuelle / Hebdomadaire</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Bassins en Service
              </span>
              <span className="text-lg font-black text-emerald-700">
                {operationalPools} / {totalPools}
              </span>
              <span className="text-[10px] text-slate-400 block">Conformité sanitaire</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Projecteurs Immergés
              </span>
              <span className="text-lg font-black text-slate-900">
                {defectivePoolLights === 0 ? '100% OK' : `${defectivePoolLights} défectueux`}
              </span>
              <span className="text-[10px] text-slate-400 block">Sur 18 bassins</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Éclairage Commun
              </span>
              <span className="text-lg font-black text-slate-900">
                {totalLightingItems - defectiveLightingItems} / {totalLightingItems}
              </span>
              <span className="text-[10px] text-slate-400 block">Points lumineux paliers</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Conformité Services
              </span>
              <span className="text-lg font-black text-blue-700">
                {serviceComplianceRate}%
              </span>
              <span className="text-[10px] text-slate-400 block">Visites validées Bureau</span>
            </div>
          </div>

          {/* Table of 18 Pools */}
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Tableau des 18 Bassins (2 par Bloc résidentiel A à I)</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Bloc</th>
                  <th className="py-2.5 px-3">Bassin</th>
                  <th className="py-2.5 px-3 text-center">Température</th>
                  <th className="py-2.5 px-3 text-center">Indice pH</th>
                  <th className="py-2.5 px-3 text-center">Chlore</th>
                  <th className="py-2.5 px-3 text-center">Éclairage</th>
                  <th className="py-2.5 px-3 text-center">Statut Baignade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pools.map((p) => {
                  const isPhOk = p.phLevel >= 7.0 && p.phLevel <= 7.6;
                  const isChlorineOk = p.chlorinePpm >= 1.0 && p.chlorinePpm <= 3.0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-bold text-slate-900">
                        Bloc {p.blockCode}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {p.type === 'adult' ? 'Grand Bassin Adulte' : 'Pataugeoire Enfant'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        {p.waterTemperatureC}°C
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`font-mono font-bold ${isPhOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {p.phLevel}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`font-mono font-bold ${isChlorineOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {p.chlorinePpm} ppm
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {p.lightingStatus === 'working' ? (
                          <span className="text-emerald-700 font-medium">Fonctionnel</span>
                        ) : (
                          <span className="text-rose-600 font-bold">Défectueux</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {p.status === 'operational' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Ouvert
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Maintenance
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Service Providers Compliance */}
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Historique Récent des Prestations Contractuelles</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Prestataire</th>
                  <th className="py-2 px-3">Type d’Intervention</th>
                  <th className="py-2 px-3">Périmètre</th>
                  <th className="py-2 px-3 text-center">Validation Syndic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {servicePassages.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {new Date(log.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {log.providerName}
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {log.category === 'cleaning' ? 'Nettoyage & Propreté Paliers' : 'Entretien Espaces Verts'}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {log.targetBlockCode ? `Bloc ${log.targetBlockCode}` : 'Ensemble de la Résidence'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {log.isBureauValidated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Validé conforme
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          En attente visa
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-700 uppercase mb-8">
                Responsable Technique & Bassins
              </div>
              <div className="font-serif italic text-slate-800 text-sm">
                Atlas Eau & Piscines S.A.R.L
              </div>
              <div className="text-[10px] text-slate-400">
                (Visa & Relevé Technique)
              </div>
            </div>

            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-700 uppercase mb-8">
                Le Président du Syndic
              </div>
              <div className="font-serif italic text-slate-800 text-sm">
                Mohamed Alami
              </div>
              <div className="text-[10px] text-slate-400">
                (Sceau de conformité)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
