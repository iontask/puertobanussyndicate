import React, { useState } from 'react';
import { OnboardingTenantData } from '../../types';
import { provisionNewTenant, ProvisionedTenantResult } from '../../services/tenant/tenantProvisioning';
import {
  Building2,
  MapPin,
  Layers,
  Waves,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  KeyRound,
  Calculator,
  Droplets,
  Zap,
  DollarSign,
  UserCheck,
} from 'lucide-react';

interface TenantOnboardingWizardProps {
  onComplete: (result: ProvisionedTenantResult, switchImmediately: boolean) => void;
  onCancel: () => void;
}

export const TenantOnboardingWizard: React.FC<TenantOnboardingWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [formData, setFormData] = useState<OnboardingTenantData>({
    // Step 1: Identité
    name: 'Résidence Les Jardins de l’Atlas',
    code: 'JARDINS-ATLAS',
    city: 'Marrakech',
    currency: 'MAD',
    address: 'Avenue Mohammed VI, Hivernage, Marrakech',
    surfaceM2: 18500,
    themeColor: '#0ea5e9',

    // Step 2: Topologie
    blockNamingMode: 'alpha',
    blockCount: 4,
    floorsPerBlock: 4,
    doorsPerFloor: 4,

    // Step 3: Équipements
    poolsPerBlock: 2,
    hasChildPools: true,
    poolWaterTreatment: 'salt',
    hasElevators: true,
    hasSurpressorPump: true,
    hasLedCommonLighting: true,

    // Step 4: Gouvernance & Quotas
    presidentName: 'Mehdi Alami',
    presidentEmail: 'mehdi.alami@atlas-residence.ma',
    presidentPhone: '+212 6 61 11 22 33',
    treasurerName: 'Nadia Tazi',
    treasurerEmail: 'nadia.tazi@atlas-residence.ma',
    treasurerPhone: '+212 6 61 44 55 66',
    feeCalculationMode: 'fixed',
    defaultFeeAmount: 550,
    billingCycle: 'quarterly',
    dueDayOfMonth: 10,
  });

  const [provisionedResult, setProvisionedResult] = useState<ProvisionedTenantResult | null>(null);

  // Totaux calculés en temps réel
  const totalApartments = formData.blockCount * formData.floorsPerBlock * formData.doorsPerFloor;
  const totalPools = formData.blockCount * formData.poolsPerBlock;
  const estimatedQuarterlyBudget = totalApartments * formData.defaultFeeAmount * 3;

  const handleNextStep = () => {
    if (currentStep === 4) {
      // Provisioning
      const result = provisionNewTenant(formData);
      setProvisionedResult(result);
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Step Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              SaaS Multi-Tenant Engine
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Provisionner une Nouvelle Copropriété
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            Quitter le Wizard
          </button>
        </div>

        {/* Stepper Indicators */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {[
            { step: 1, title: 'Identité', desc: 'Nom, ville & devise' },
            { step: 2, title: 'Topologie', desc: `${totalApartments} lots calculés` },
            { step: 3, title: 'Équipements', desc: `${totalPools} bassins & tech` },
            { step: 4, title: 'Gouvernance', desc: 'Bureau & Cotisations' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;

            return (
              <div
                key={item.step}
                className={`p-3 rounded-xl border text-left transition ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/30 text-emerald-800'
                    : 'border-slate-200 text-slate-400 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : item.step}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
        {/* STEP 1: IDENTITÉ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Étape 1 — Identité de la Copropriété
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Définissez les informations juridiques et administratives du nouveau tenant.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom officiel de la Copropriété *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Résidence Les Jardins de l’Atlas"
                  className="w-full text-sm rounded-xl border border-slate-300 p-3 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Code unique du Tenant (Slug de sécurité) *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                    })
                  }
                  placeholder="Ex: JARDINS-ATLAS"
                  className="w-full text-sm font-mono uppercase rounded-xl border border-slate-300 p-3 bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Utilisé pour l'isolation stricte des données Firestore (request.auth.token.tenantId).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ville / Localité *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Marrakech, Casablanca, Tanger..."
                  className="w-full text-sm rounded-xl border border-slate-300 p-3 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Avenue Mohammed VI, Hivernage..."
                  className="w-full text-sm rounded-xl border border-slate-300 p-3 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Devise de gestion comptable
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-3 bg-white"
                >
                  <option value="MAD">Dirham Marocain (MAD)</option>
                  <option value="EUR">Euro (€ - EUR)</option>
                  <option value="USD">Dollar US ($ - USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Couleur d'accentuation / Thème
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                    className="w-12 h-11 rounded-xl border border-slate-300 p-1 cursor-pointer bg-white"
                  />
                  <span className="text-xs font-mono text-slate-600">{formData.themeColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TOPOLOGIE SPATIALE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Étape 2 — Topologie Spatiale & Lots Privatifs
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configurez l'architecture spatiale. Les tantièmes (base 10 000) sont générés automatiquement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de Blocs (Bâtiments)
                </label>
                <input
                  type="number"
                  min="1"
                  max="26"
                  value={formData.blockCount}
                  onChange={(e) =>
                    setFormData({ ...formData, blockCount: parseInt(e.target.value) || 1 })
                  }
                  className="w-full text-base font-bold text-slate-900 rounded-xl border border-slate-300 p-2.5 bg-white text-center"
                />
                <p className="text-[11px] text-slate-500 mt-1 text-center">
                  Blocs A à {String.fromCharCode(64 + Math.min(26, formData.blockCount))}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Étages par Bloc
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.floorsPerBlock}
                  onChange={(e) =>
                    setFormData({ ...formData, floorsPerBlock: parseInt(e.target.value) || 1 })
                  }
                  className="w-full text-base font-bold text-slate-900 rounded-xl border border-slate-300 p-2.5 bg-white text-center"
                />
                <p className="text-[11px] text-slate-500 mt-1 text-center">
                  RDC + {formData.floorsPerBlock - 1} étages
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appartements par Étage
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.doorsPerFloor}
                  onChange={(e) =>
                    setFormData({ ...formData, doorsPerFloor: parseInt(e.target.value) || 1 })
                  }
                  className="w-full text-base font-bold text-slate-900 rounded-xl border border-slate-300 p-2.5 bg-white text-center"
                />
                <p className="text-[11px] text-slate-500 mt-1 text-center">Portes par niveau</p>
              </div>
            </div>

            {/* Arborescence & Tantièmes prévisualisés */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Barème des Tantièmes Généré Automatiquement
                </span>
                <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  Total : 10 000 / 10 000 tantièmes
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[11px]">Total Blocs</span>
                  <span className="text-base font-bold text-slate-900">{formData.blockCount}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[11px]">Lots par Bâtiment</span>
                  <span className="text-base font-bold text-slate-900">
                    {formData.floorsPerBlock * formData.doorsPerFloor}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[11px]">Total Lots Privatifs</span>
                  <span className="text-base font-bold text-blue-600">{totalApartments}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[11px]">Quote-part moy./lot</span>
                  <span className="text-base font-bold text-slate-900">
                    {Math.round(10000 / totalApartments)} ‰
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ÉQUIPEMENTS & ZONES TECHNIQUES */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Waves className="w-5 h-5 text-blue-600" />
                Étape 3 — Équipements Communs & Zones Techniques
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supervision des piscines, traitement physico-chimique et locaux techniques.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Bassins de Piscine par Bâtiment
                </label>
                <div className="flex gap-2">
                  {[1, 2].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, poolsPerBlock: num })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        formData.poolsPerBlock === num
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {num === 2 ? '2 bassins (Adulte + Pataugeoire)' : '1 grand bassin adulte'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Procédé de Traitement de l'Eau
                </label>
                <select
                  value={formData.poolWaterTreatment}
                  onChange={(e) =>
                    setFormData({ ...formData, poolWaterTreatment: e.target.value as any })
                  }
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium"
                >
                  <option value="salt">Électrolyse au Sel (Recommandé)</option>
                  <option value="chlorine">Chlore stabilisé & Régulateur pH auto</option>
                  <option value="bromine">Traitement au Brome</option>
                </select>
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Équipements Techniques des Bâtiments
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasElevators}
                      onChange={(e) =>
                        setFormData({ ...formData, hasElevators: e.target.checked })
                      }
                      className="rounded-sm text-blue-600 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-slate-800">
                      Ascenseurs OTIS / Schindler
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSurpressorPump}
                      onChange={(e) =>
                        setFormData({ ...formData, hasSurpressorPump: e.target.checked })
                      }
                      className="rounded-sm text-blue-600 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-slate-800">
                      Surpresseurs Eau Potable
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasLedCommonLighting}
                      onChange={(e) =>
                        setFormData({ ...formData, hasLedCommonLighting: e.target.checked })
                      }
                      className="rounded-sm text-blue-600 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-slate-800">
                      Éclairage LED Crépusculaire
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: GOUVERNANCE & COTISATIONS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Étape 4 — Gouvernance & Paramètres Financiers
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Désignation initiale du bureau syndical et barème des appels de fonds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Président */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Président du Syndic
                </span>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={formData.presidentName}
                  onChange={(e) => setFormData({ ...formData, presidentName: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={formData.presidentEmail}
                  onChange={(e) => setFormData({ ...formData, presidentEmail: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="Numéro de téléphone"
                  value={formData.presidentPhone}
                  onChange={(e) => setFormData({ ...formData, presidentPhone: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
              </div>

              {/* Trésorier */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Trésorier Général
                </span>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={formData.treasurerName}
                  onChange={(e) => setFormData({ ...formData, treasurerName: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={formData.treasurerEmail}
                  onChange={(e) => setFormData({ ...formData, treasurerEmail: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="Numéro de téléphone"
                  value={formData.treasurerPhone}
                  onChange={(e) => setFormData({ ...formData, treasurerPhone: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
              </div>

              {/* Barème cotisations */}
              <div className="sm:col-span-2 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Barème des Cotisations Syndicales
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Mode de répartition
                    </label>
                    <select
                      value={formData.feeCalculationMode}
                      onChange={(e) =>
                        setFormData({ ...formData, feeCalculationMode: e.target.value as any })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      <option value="fixed">Forfait fixe par lot</option>
                      <option value="tantiemes">Au tantième (base 10 000)</option>
                      <option value="surface">Au m² habitable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Montant de référence ({formData.currency}/mois)
                    </label>
                    <input
                      type="number"
                      value={formData.defaultFeeAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultFeeAmount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Appel de fonds
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) =>
                        setFormData({ ...formData, billingCycle: e.target.value as any })
                      }
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      <option value="quarterly">Trimestriel (recommandé)</option>
                      <option value="monthly">Mensuel</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 flex justify-between items-center">
                  <span>Budget prévisionnel trimestriel estimé :</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {estimatedQuarterlyBudget.toLocaleString('fr-FR')} {formData.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & PROVISIONING SUCCEEDED */}
        {currentStep === 5 && provisionedResult && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Tenant Provisionné avec Succès
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                {provisionedResult.tenant.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                ID: {provisionedResult.tenant.id} • Code: {provisionedResult.tenant.code}
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">Bâtiments</span>
                <span className="text-lg font-bold text-slate-900">
                  {provisionedResult.blocks.length} Blocs
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">Lots Privatifs</span>
                <span className="text-lg font-bold text-blue-600">
                  {provisionedResult.apartments.length} Lots
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">Bassins Piscine</span>
                <span className="text-lg font-bold text-cyan-600">
                  {provisionedResult.pools.length} Bassins
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">Utilisateurs Initiaux</span>
                <span className="text-lg font-bold text-slate-900">
                  {provisionedResult.users.length} Comptes
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 max-w-lg mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
              L'isolation de sécurité Firestore est hermétique sous{' '}
              <code className="text-blue-700 font-bold">{provisionedResult.tenant.id}</code>. Les données de la résidence modèle Puerto Banús sont préservées à 100%.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onComplete(provisionedResult, false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Retour à la Console SaaS Plateforme
              </button>
              <button
                type="button"
                onClick={() => onComplete(provisionedResult, true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Basculer immédiatement sur cette Copropriété</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS (Steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition cursor-pointer"
            >
              <span>{currentStep === 4 ? 'Générer & Provisionner le Tenant' : 'Étape Suivante'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
