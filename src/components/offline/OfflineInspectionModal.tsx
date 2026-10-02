import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { Pool, PoolStatus, LightingStatus, ServicePassageLog } from '../../types';
import { offlineSyncService } from '../../services/offline/offlineSync';
import { compressImageFile, formatFileSize } from '../../services/offline/imageCompressor';
import {
  Waves,
  Wrench,
  Camera,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';

interface OfflineInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPool?: Pool;
}

export const OfflineInspectionModal: React.FC<OfflineInspectionModalProps> = ({
  isOpen,
  onClose,
  defaultPool,
}) => {
  const { currentUser, currentTenant } = useAuth();
  const { pools, recordPoolMaintenance, addServicePassage } = useResidence();

  const [inspectionType, setInspectionType] = useState<'pool' | 'passage'>('pool');
  const [selectedPoolId, setSelectedPoolId] = useState<string>(
    defaultPool ? defaultPool.id : pools[0]?.id || ''
  );

  // Pool parameters
  const [phLevel, setPhLevel] = useState<number>(7.2);
  const [chlorinePpm, setChlorinePpm] = useState<number>(1.5);
  const [waterTemp, setWaterTemp] = useState<number>(25);
  const [poolStatus, setPoolStatus] = useState<PoolStatus>('operational');
  const [lightingStatus, setLightingStatus] = useState<LightingStatus>('working');

  // Passage parameters
  const [serviceType, setServiceType] = useState<'hygiene' | 'security' | 'gardening' | 'pools'>('pools');
  const [providerName, setProviderName] = useState<string>(
    currentUser.role === 'provider' ? currentUser.name : 'Atlas Nettoyage & Maintenance'
  );
  const [observations, setObservations] = useState<string>('');

  // Image upload with compression
  const [selectedPhoto, setSelectedPhoto] = useState<{
    file: File;
    dataUrl: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImageFile(file, {
        maxWidth: 1280,
        quality: 0.75,
      });
      setSelectedPhoto({
        file: compressed.file,
        dataUrl: compressed.dataUrl,
        originalSize: compressed.originalSizeBytes,
        compressedSize: compressed.compressedSizeBytes,
        compressionRatio: compressed.compressionRatioPercent,
      });
    } catch (err) {
      console.error('Erreur compression image', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (inspectionType === 'pool') {
      const payload = {
        poolId: selectedPoolId,
        phLevel,
        chlorinePpm,
        waterTemperatureC: waterTemp,
        status: poolStatus,
        lightingStatus,
        lastCleanedAt: new Date().toISOString(),
        photoUrl: selectedPhoto?.dataUrl,
        notes: observations,
      };

      // Si hors-ligne ou même pour robustesse : on met en file d'attente
      offlineSyncService.enqueueAction({
        type: 'pool_check',
        tenantId: currentTenant.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        data: payload,
      });

      // Si online, on applique aussi directement au context pour réactivité instantanée
      if (isOnline) {
        recordPoolMaintenance(selectedPoolId, {
          phLevel,
          chlorinePpm,
          waterTemperatureC: waterTemp,
          status: poolStatus,
          lightingStatus,
          lastCleanedAt: new Date().toISOString(),
        });
      }
    } else {
      const passageLog: ServicePassageLog = {
        id: `passage-${Date.now()}`,
        trade: (serviceType === 'security' || serviceType === 'gardening' ? serviceType : 'cleaning'),
        blockId: 'block-h',
        providerName,
        agentName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        timeSlot: '09:00 - 11:30',
        title: `Passage ${serviceType} (Contrôle PWA)`,
        description: observations || 'Ronde et contrôle d’intégrité terrain effectuée via PWA',
        tasksDone: [
          observations || 'Ronde de surveillance et contrôle terrain',
          'Vérification des accès et parties communes',
        ],
        status: 'validated',
        validatedBy: currentUser.name,
        validatedAt: new Date().toISOString(),
      };

      offlineSyncService.enqueueAction({
        type: 'service_passage',
        tenantId: currentTenant.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        data: passageLog,
      });

      if (isOnline) {
        addServicePassage(passageLog);
      }
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1600);
  };

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Relevé Terrain Résilient (PWA)</h3>
                <p className="text-xs text-slate-400">
                  Fonctionne hors-ligne avec synchronisation automatique
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isOnline && (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Réseau coupé : ce relevé sera conservé et envoyé dès reconnexion.</span>
            </div>
          )}
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Relevé enregistré avec succès !</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isOnline
                ? 'Les données ont été instantanément transmises et intégrées au registre.'
                : 'Stocké localement dans la file d’attente offline. Synchro automatique en arrière-plan.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setInspectionType('pool')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                  inspectionType === 'pool'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-cyan-600" />
                <span>Contrôle Piscine</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectionType('passage')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
                  inspectionType === 'passage'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Passage Prestataire</span>
              </button>
            </div>

            {inspectionType === 'pool' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bassin contrôlé
                  </label>
                  <select
                    value={selectedPoolId}
                    onChange={(e) => setSelectedPoolId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {pools.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id.toUpperCase()} — Bloc {p.blockId.replace('block-', '').toUpperCase()} ({p.type === 'adult' ? 'Grand Bassin' : 'Pataugeoire'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      pH ({phLevel})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="6.5"
                      max="8.5"
                      value={phLevel}
                      onChange={(e) => setPhLevel(parseFloat(e.target.value) || 7.2)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Chlore ({chlorinePpm} ppm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="5.0"
                      value={chlorinePpm}
                      onChange={(e) => setChlorinePpm(parseFloat(e.target.value) || 1.5)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Eau ({waterTemp} °C)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="15"
                      max="36"
                      value={waterTemp}
                      onChange={(e) => setWaterTemp(parseInt(e.target.value) || 25)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-center font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Statut Bassin
                    </label>
                    <select
                      value={poolStatus}
                      onChange={(e) => setPoolStatus(e.target.value as PoolStatus)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      <option value="operational">Opérationnel</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="closed">Fermé / Hivernage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Éclairage
                    </label>
                    <select
                      value={lightingStatus}
                      onChange={(e) => setLightingStatus(e.target.value as LightingStatus)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      <option value="working">Fonctionnel</option>
                      <option value="defective">Défectueux</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catégorie de prestation
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as any)}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800"
                    >
                      <option value="pools">Piscines & Bassins</option>
                      <option value="hygiene">Nettoyage & Hygiène</option>
                      <option value="security">Sécurité & Gardiennage</option>
                      <option value="gardening">Espaces Verts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Prestataire
                    </label>
                    <input
                      type="text"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Observations */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observations & Constatations
              </label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Nettoyage panier préfiltre effectué, skimmer dégagé, eau cristalline..."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photo capture with client-side compression */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Photo terrain (Constat)
                </label>
                <span className="text-[11px] text-blue-600 font-medium">
                  Compression auto ~90%
                </span>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                {selectedPhoto ? (
                  <div className="flex items-center gap-3 text-left">
                    <img
                      src={selectedPhoto.dataUrl}
                      alt="Constat compressé"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-slate-900">{selectedPhoto.file.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {formatFileSize(selectedPhoto.originalSize)} ➔{' '}
                        <span className="text-emerald-600 font-bold">
                          {formatFileSize(selectedPhoto.compressedSize)}
                        </span>{' '}
                        (-{selectedPhoto.compressionRatio}%)
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(null)}
                        className="text-[11px] text-rose-600 hover:underline mt-1 cursor-pointer font-medium"
                      >
                        Supprimer la photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-700">
                      Prendre une photo ou sélectionner
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Compressée côté client pour optimiser les données mobiles
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
                {isCompressing && (
                  <p className="text-[11px] text-blue-600 mt-1 animate-pulse font-medium">
                    Compression de l'image en cours...
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enregistrer le relevé</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
