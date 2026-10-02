import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import {
  Complaint,
  ComplaintPriority,
  ComplaintCategory,
  ComplaintScope,
  ComplaintZoneType,
  ComplaintStatus,
} from '../../types';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  UploadCloud,
  Layers,
  Wrench,
  DollarSign,
  UserCheck,
  Calendar,
} from 'lucide-react';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaint: Complaint) => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, currentTenant, assignedBlock, assignedApartment, isResidentScoped, isBlockScoped, isPresidentScoped } = useAuth();
  const { blocks, pools, commonLighting } = useResidence();

  // Scope & Zone
  const [scope, setScope] = useState<ComplaintScope>(isResidentScoped ? 'private' : 'common');
  const [zoneType, setZoneType] = useState<ComplaintZoneType>(isResidentScoped ? 'private_lot' : 'block_stairwell');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(
    assignedBlock ? assignedBlock.id : 'block-h'
  );
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [apartmentDoor, setApartmentDoor] = useState(assignedApartment?.doorNumber || (isBlockScoped ? 'H-12' : ''));

  // Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('pool');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');

  // Staff / President extra fields
  const [status, setStatus] = useState<ComplaintStatus>('new');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<string>('');

  // Photos
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  // Equipment options filtered by selected block
  const blockPools = pools.filter((p) => p.blockId === selectedBlockId);
  const blockLighting = commonLighting.filter((l) => l.blockId === selectedBlockId);

  const handleScopeChange = (newScope: ComplaintScope) => {
    setScope(newScope);
    if (newScope === 'private') {
      setZoneType('private_lot');
      setSelectedEquipmentId('');
    } else {
      setZoneType('block_stairwell');
    }
  };

  const handleZoneTypeChange = (newZone: ComplaintZoneType) => {
    setZoneType(newZone);
    if (newZone === 'block_pool_adult') {
      const adult = blockPools.find((p) => p.poolType === 'adult');
      if (adult) setSelectedEquipmentId(adult.id);
      setCategory('pool');
    } else if (newZone === 'block_pool_child') {
      const child = blockPools.find((p) => p.poolType === 'child');
      if (child) setSelectedEquipmentId(child.id);
      setCategory('pool');
    } else if (newZone === 'block_stairwell') {
      const light = blockLighting[0];
      if (light) setSelectedEquipmentId(light.id);
    } else {
      setSelectedEquipmentId('');
    }
  };

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80',
    ];
    const picked = samplePhotos[attachedPhotos.length % samplePhotos.length];
    setAttachedPhotos((prev) => [...prev, picked]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newTicket: Complaint = {
        id: `cmp-${Date.now().toString().slice(-6)}`,
        tenantId: currentTenant.id,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        scope,
        zoneType,
        equipmentId: selectedEquipmentId || undefined,
        blockId: selectedBlockId,
        apartmentId: apartmentDoor ? `apt-${apartmentDoor.toLowerCase()}` : undefined,
        createdAt: new Date().toISOString(),
        authorUserId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.role,
        assignedTo: assignedTo.trim() || undefined,
        assignedTechnician: assignedTechnician.trim() || undefined,
        scheduledDate: scheduledDate || undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        photos: attachedPhotos.length > 0 ? attachedPhotos : undefined,
        activityLogs: [
          {
            id: `act-init-${Date.now()}`,
            timestamp: new Date().toISOString(),
            authorName: currentUser.name,
            authorRole: currentUser.role,
            action: `Création du signalement (${isResidentScoped ? 'Résident' : 'Administration'})`,
            newStatus: status,
            notes: description.trim(),
          },
        ],
      };

      setIsSubmitting(false);
      setShowConfirmation(true);

      setTimeout(() => {
        onSuccess(newTicket);
        setShowConfirmation(false);
        onClose();
      }, 1000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="modal-new-complaint"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl my-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                {isResidentScoped ? 'Nouveau signalement incident' : 'Enregistrer une intervention / Réclamation'}
              </h3>
              <p className="text-xs text-slate-500">
                Workflow Puerto Banus avec traçabilité complète et notification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showConfirmation ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Signalement enregistré avec succès</h4>
            <p className="text-sm text-slate-500 max-w-sm">
              Votre ticket a été transmis avec priorité {priority.toUpperCase()} au conseil syndical et aux prestataires.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Scope selection tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Périmètre de l'incident *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-scope-private"
                  onClick={() => handleScopeChange('private')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                    scope === 'private'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/10'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Lot Privatif (Mon appartement)</span>
                </button>
                <button
                  type="button"
                  id="btn-scope-common"
                  onClick={() => handleScopeChange('common')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                    scope === 'common'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/10'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Parties Communes / Extérieur</span>
                </button>
              </div>
            </div>

            {/* Zone selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bloc concerné *
                </label>
                <select
                  id="select-complaint-block"
                  value={selectedBlockId}
                  disabled={Boolean(assignedBlock) && !isPresidentScoped}
                  onChange={(e) => setSelectedBlockId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      Bloc {b.code} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Zone précise *
                </label>
                <select
                  id="select-complaint-zone"
                  value={zoneType}
                  onChange={(e) => handleZoneTypeChange(e.target.value as ComplaintZoneType)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {scope === 'private' ? (
                    <option value="private_lot">Intérieur de l'appartement</option>
                  ) : (
                    <>
                      <option value="block_pool_adult">Grand Bassin (Piscine Adulte)</option>
                      <option value="block_pool_child">Petit Bassin (Pataugeoire)</option>
                      <option value="block_stairwell">Cage d'escalier & Paliers</option>
                      <option value="block_garden">Espaces verts & Allées abords</option>
                      <option value="parking">Parking sous-sol</option>
                      <option value="general_perimeter">Périmètre général / Clôture</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* If scope is private, show Door Number */}
            {scope === 'private' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Numéro de porte / Lot
                </label>
                <input
                  type="text"
                  value={apartmentDoor}
                  onChange={(e) => setApartmentDoor(e.target.value)}
                  placeholder="Ex: H-12"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            )}

            {/* Equipment association if common */}
            {scope === 'common' && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Équipement rattaché (Facility Management)
                </label>
                <select
                  id="select-complaint-equipment"
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">-- Aucun équipement spécifique (Général) --</option>
                  <optgroup label="Bassins du bloc">
                    {blockPools.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.poolType === 'adult' ? 'Grand bain' : 'Petit bain'}) - {p.volumeM3}m³
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Éclairages du bloc">
                    {blockLighting.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label} ({l.location})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  En rattachant un équipement, son statut et ses alertes seront synchronisés avec la résolution de ce ticket.
                </p>
              </div>
            )}

            {/* Title & Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Titre de l'incident *
              </label>
              <input
                id="input-complaint-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Éclairage immergé défectueux, fuite palière, minuterie..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corps d'état / Catégorie *
                </label>
                <select
                  id="select-complaint-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="pool">Piscine / Filtration / Sonde</option>
                  <option value="lighting">Éclairage / Électricité</option>
                  <option value="plumbing">Plomberie / Fuite / Colonne</option>
                  <option value="elevator">Ascenseur</option>
                  <option value="cleanliness">Propreté / Ménage</option>
                  <option value="gardening">Espaces verts / Élagage</option>
                  <option value="security">Sécurité / Portillon / Accès</option>
                  <option value="noise">Nuisances sonores</option>
                  <option value="other">Autre réclamation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Niveau d'urgence *
                </label>
                <select
                  id="select-complaint-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="low">Basse (Simple remarque)</option>
                  <option value="medium">Moyenne (Sous 48h)</option>
                  <option value="high">Haute (Action sous 24h)</option>
                  <option value="urgent">🚨 Urgente (Sécurité / Dégât des eaux immédiat)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description détaillée & Constat *
              </label>
              <textarea
                id="textarea-complaint-desc"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Précisez la localisation exacte, les symptômes constatés, les heures d'apparition..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Photo upload simulation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Photos / Justificatifs terrain
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="btn-add-sample-photo"
                  onClick={handleAddSamplePhoto}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Joindre photo constat</span>
                </button>
                <span className="text-xs text-slate-500">
                  {attachedPhotos.length} photo(s) jointe(s)
                </span>
              </div>
              {attachedPhotos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {attachedPhotos.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200 group">
                      <img src={url} alt="Preuve" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachedPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff only: Dispatch & Chiffrage */}
            {!isResidentScoped && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 bg-slate-50 p-3.5 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Prise en charge & Dispatch prestataire (Gestionnaire)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Statut d'enregistrement
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                    >
                      <option value="new">Nouveau (En attente examen)</option>
                      <option value="pending">En attente devis / consultation</option>
                      <option value="assigned">Assigné à un prestataire</option>
                      <option value="in_progress">En cours d'intervention</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Société prestataire
                    </label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Ex: LuminaTech, AquaPool..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Technicien référent
                    </label>
                    <input
                      type="text"
                      value={assignedTechnician}
                      onChange={(e) => setAssignedTechnician(e.target.value)}
                      placeholder="Ex: Rachid B."
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Date prévue
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Devis estimé (MAD)
                    </label>
                    <input
                      type="number"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="1450"
                      className="w-full px-2 py-1.5 text-xs rounded-md border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                id="btn-submit-complaint"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-xs transition"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer le signalement'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
