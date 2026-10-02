import React, { useState } from 'react';
import { RecurringServiceTrade, ServicePassageLog } from '../../types';
import { useResidence } from '../../context/ResidenceContext';
import { X, Send, Sparkles, Shield, TreePine, CheckCircle2 } from 'lucide-react';

interface NewServicePassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (passage: ServicePassageLog) => void;
}

export const NewServicePassageModal: React.FC<NewServicePassageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { blocks } = useResidence();

  const [trade, setTrade] = useState<RecurringServiceTrade>('cleaning');
  const [blockId, setBlockId] = useState('block-h');
  const [providerName, setProviderName] = useState('Société CleanNet Marina SARL');
  const [agentName, setAgentName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeSlot, setTimeSlot] = useState('08:30 - 11:30');
  const [tasksDoneText, setTasksDoneText] = useState('');
  const [stairwellsChecked, setStairwellsChecked] = useState(true);
  const [poolSurroundingsChecked, setPoolSurroundingsChecked] = useState(true);
  const [greenAreasTreated, setGreenAreasTreated] = useState(false);
  const [securityRounds, setSecurityRounds] = useState(4);

  if (!isOpen) return null;

  const handleTradeChange = (newTrade: RecurringServiceTrade) => {
    setTrade(newTrade);
    if (newTrade === 'cleaning') {
      setProviderName('Société CleanNet Marina SARL');
      setTitle('Passage Ménage & Nettoyage Abords Bassins');
      setStairwellsChecked(true);
      setPoolSurroundingsChecked(true);
      setGreenAreasTreated(false);
    } else if (newTrade === 'gardening') {
      setProviderName('Verts Jardins du Détroit');
      setTitle('Entretien Espaces Verts & Arrosage');
      setStairwellsChecked(false);
      setPoolSurroundingsChecked(true);
      setGreenAreasTreated(true);
    } else {
      setProviderName('Marina Security Guarding');
      setTitle('Rondes Nocturnes & Main Courante');
      setBlockId('all');
      setStairwellsChecked(true);
      setPoolSurroundingsChecked(true);
      setGreenAreasTreated(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tasks = tasksDoneText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPassage: ServicePassageLog = {
      id: `srv-pass-${Date.now().toString().slice(-6)}`,
      trade,
      blockId,
      providerName,
      agentName: agentName.trim() || 'Équipe de service',
      date: new Date().toISOString().slice(0, 10),
      timeSlot,
      title: title.trim() || `Passage ${trade}`,
      description: description.trim(),
      tasksDone: tasks.length > 0 ? tasks : ['Prestation exécutée conformément au cahier des charges'],
      stairwellsChecked,
      poolSurroundingsChecked,
      greenAreasTreated,
      securityRoundCount: trade === 'security' ? securityRounds : undefined,
      status: 'completed_pending_validation',
    };

    onSuccess(newPassage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Consigner une fiche de passage / Émargement
            </h3>
            <p className="text-xs text-slate-500">
              Enregistre un passage d'équipe pour soumission au représentant de bloc
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Trade selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Corps de service *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTradeChange('cleaning')}
                className={`py-2 px-3 rounded-lg border flex flex-col items-center gap-1 font-semibold transition ${
                  trade === 'cleaning'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Ménage</span>
              </button>
              <button
                type="button"
                onClick={() => handleTradeChange('gardening')}
                className={`py-2 px-3 rounded-lg border flex flex-col items-center gap-1 font-semibold transition ${
                  trade === 'gardening'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <TreePine className="w-4 h-4 text-emerald-600" />
                <span>Jardinage</span>
              </button>
              <button
                type="button"
                onClick={() => handleTradeChange('security')}
                className={`py-2 px-3 rounded-lg border flex flex-col items-center gap-1 font-semibold transition ${
                  trade === 'security'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Sécurité</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Périmètre / Bloc *
              </label>
              <select
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">Global Résidence (9 Blocs)</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bloc {b.code} ({b.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Créneau horaire *
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="Ex: 08:30 - 11:30"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Entreprise prestataire
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nom des intervenants / Agents
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Ex: Aicha & Fatima"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Intitulé du passage *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          {/* Checklist zones */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
              Points de contrôle obligatoires :
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={stairwellsChecked}
                  onChange={(e) => setStairwellsChecked(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Cages d'escalier & Paliers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={poolSurroundingsChecked}
                  onChange={(e) => setPoolSurroundingsChecked(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Abords des 2 bassins (plages & douches)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={greenAreasTreated}
                  onChange={(e) => setGreenAreasTreated(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Espaces verts / Arrosage</span>
              </label>
            </div>
          </div>

          {trade === 'security' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nombre de rondes de surveillance effectuées
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={securityRounds}
                onChange={(e) => setSecurityRounds(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Détail des tâches accomplies (une par ligne)
            </label>
            <textarea
              rows={3}
              value={tasksDoneText}
              onChange={(e) => setTasksDoneText(e.target.value)}
              placeholder="Ex:&#10;Balayage et lavage des paliers R+1 à R+3&#10;Lavage dalles plage grand bassin&#10;Désinfection poignées de portes"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enregistrer le passage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
