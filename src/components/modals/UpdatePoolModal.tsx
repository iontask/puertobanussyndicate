import React, { useState, useEffect } from 'react';
import { Pool, PoolStatus, LightingStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import {
  X,
  Waves,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Droplets,
  Sparkles,
  Clock,
  ShieldAlert,
  Save,
} from 'lucide-react';

interface UpdatePoolModalProps {
  isOpen: boolean;
  pool: Pool | null;
  onClose: () => void;
}

export const UpdatePoolModal: React.FC<UpdatePoolModalProps> = ({ isOpen, pool, onClose }) => {
  const { currentUser } = useAuth();
  const { recordPoolMaintenance, getBlockById } = useResidence();

  const [status, setStatus] = useState<PoolStatus>('operational');
  const [lightingStatus, setLightingStatus] = useState<LightingStatus>('working');
  const [waterTemp, setWaterTemp] = useState<string>('25.5');
  const [phLevel, setPhLevel] = useState<string>('7.2');
  const [chlorinePpm, setChlorinePpm] = useState<string>('1.4');
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (pool) {
      setStatus(pool.status);
      setLightingStatus(pool.lightingStatus);
      setWaterTemp(pool.waterTemperatureC ? pool.waterTemperatureC.toString() : '25.5');
      setPhLevel(pool.phLevel ? pool.phLevel.toString() : '7.2');
      setChlorinePpm(pool.chlorinePpm ? pool.chlorinePpm.toString() : '1.4');
      setNotes('');
      setIsSaved(false);
    }
  }, [pool]);

  if (!isOpen || !pool) return null;

  const block = getBlockById(pool.blockId);

  // RBAC permission check:
  // - President & Treasurer: can update any of the 18 pools
  // - Block Rep: can only update pools of their assigned block (e.g. block-h)
  // - Resident: read-only
  const canEdit =
    currentUser.role === 'president' ||
    currentUser.role === 'treasurer' ||
    (currentUser.role === 'block_rep' && pool.blockId === currentUser.assignedBlockId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    recordPoolMaintenance(pool.id, {
      status,
      lightingStatus,
      waterTemperatureC: parseFloat(waterTemp) || pool.waterTemperatureC,
      phLevel: parseFloat(phLevel) || pool.phLevel,
      chlorinePpm: parseFloat(chlorinePpm) || pool.chlorinePpm,
      lastCleanedAt: new Date().toISOString(),
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleQuickCleanStamp = () => {
    if (!canEdit) return;
    recordPoolMaintenance(pool.id, {
      lastCleanedAt: new Date().toISOString(),
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
              {block?.code}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Maintenance Bassin • {block?.name.split(' - ')[1] || block?.name}
              </h3>
              <p className="text-xs text-slate-500">
                {pool.type === 'adult' ? 'Grand Bassin Adulte (Profondeur 1.80m)' : 'Pataugeoire Enfant (Profondeur 0.45m)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* RBAC notice if unauthorized */}
        {!canEdit && (
          <div className="m-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Mode Consultation (RBAC)</p>
              <p className="text-amber-700 mt-0.5">
                {currentUser.role === 'resident'
                  ? 'En tant que résident, les modifications techniques de bassin sont réservées au syndic et aux représentants de bloc.'
                  : `Votre mandat de représentant est limité à votre bloc (${currentUser.assignedBlockId?.replace('block-', '').toUpperCase()}). Seul le représentant du Bloc ${block?.code} ou le bureau syndical peut consigner des interventions ici.`}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Statut d'exploitation */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Statut d'Exploitation & Baignade
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setStatus('operational')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition flex flex-col items-center gap-1 ${
                  status === 'operational'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Opérationnelle</span>
              </button>

              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setStatus('maintenance')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition flex flex-col items-center gap-1 ${
                  status === 'maintenance'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Maintenance</span>
              </button>

              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setStatus('closed')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition flex flex-col items-center gap-1 ${
                  status === 'closed'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Fermée</span>
              </button>
            </div>
          </div>

          {/* Éclairage subaquatique */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Éclairage Subaquatique & Projecteurs LED
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setLightingStatus('working')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition flex items-center justify-center gap-2 ${
                  lightingStatus === 'working'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fonctionnel</span>
              </button>

              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setLightingStatus('defective')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition flex items-center justify-center gap-2 ${
                  lightingStatus === 'defective'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-600" />
                <span>Défectueux / Signalé</span>
              </button>
            </div>
          </div>

          {/* Relevés physico-chimiques */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Relevés Physico-Chimiques Journaliers
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-500" /> Température (°C)
                </span>
                <input
                  type="number"
                  step="0.1"
                  disabled={!canEdit}
                  value={waterTemp}
                  onChange={(e) => setWaterTemp(e.target.value)}
                  className="w-full mt-1 font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-500" /> pH de l'eau
                </span>
                <input
                  type="number"
                  step="0.1"
                  disabled={!canEdit}
                  value={phLevel}
                  onChange={(e) => setPhLevel(e.target.value)}
                  className="w-full mt-1 font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-500" /> Chlore (ppm)
                </span>
                <input
                  type="number"
                  step="0.1"
                  disabled={!canEdit}
                  value={chlorinePpm}
                  onChange={(e) => setChlorinePpm(e.target.value)}
                  className="w-full mt-1 font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Dernier curage & Nettoyage */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[11px] block">Dernier curage enregistré</span>
              <span className="font-semibold text-slate-800 text-xs">
                {new Date(pool.lastCleanedAt).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={handleQuickCleanStamp}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-[11px] flex items-center gap-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Consigner passage immédiat</span>
              </button>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition"
            >
              Fermer
            </button>

            {canEdit && (
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Enregistré avec succès !' : 'Mettre à jour le bassin'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
