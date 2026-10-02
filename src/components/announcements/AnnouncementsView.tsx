import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResidence } from '../../context/ResidenceContext';
import { AnnouncementPriority, BlockCode } from '../../types';
import { AnnouncementCard } from './AnnouncementCard';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import {
  Megaphone,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  CheckCheck,
  Building2,
  AlertTriangle,
  Info,
  Wrench,
  Lock,
} from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const { currentUser, isBlockScoped, isResidentScoped } = useAuth();
  const {
    getAnnouncementsForUser,
    readAnnouncementIds,
    markAnnouncementAsRead,
    markAllAnnouncementsAsRead,
    unreadAnnouncementsCountForUser,
  } = useResidence();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'residence' | 'my_block'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | AnnouncementPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const myBlockCode: BlockCode = currentUser.assignedBlockCode || 'H';

  // Get isolated announcements based on role and block
  const visibleAnnouncements = useMemo(() => {
    return getAnnouncementsForUser(
      currentUser.role,
      currentUser.assignedBlockId,
      currentUser.assignedBlockCode
    );
  }, [getAnnouncementsForUser, currentUser]);

  const unreadCount = useMemo(() => {
    return unreadAnnouncementsCountForUser(
      currentUser.role,
      currentUser.assignedBlockId,
      currentUser.assignedBlockCode
    );
  }, [unreadAnnouncementsCountForUser, currentUser, readAnnouncementIds]);

  // Apply UI filters
  const filteredAnnouncements = useMemo(() => {
    return visibleAnnouncements.filter((a) => {
      // Scope filter
      if (scopeFilter === 'residence' && a.scope !== 'residence') return false;
      if (scopeFilter === 'my_block' && a.scope !== 'block') return false;

      // Priority filter
      if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(q);
        const matchesContent = a.content.toLowerCase().includes(q);
        const matchesAuthor = a.authorName.toLowerCase().includes(q);
        return matchesTitle || matchesContent || matchesAuthor;
      }

      return true;
    });
  }, [visibleAnnouncements, scopeFilter, priorityFilter, searchQuery]);

  const canCreate =
    currentUser.role === 'president' ||
    currentUser.role === 'treasurer' ||
    currentUser.role === 'block_rep';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Lot 5 • Communication Ciblée
            </span>
            <span className="text-xs text-slate-400">Diffusion & Alertes</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Annonces Officielles & Informations Résidence
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Canal certifié du syndic et des représentants. Diffusion globale ou circonscrite avec étanchéité stricte inter-blocs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              id="btn-mark-all-announcements-read"
              onClick={() => markAllAnnouncementsAsRead()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
            >
              <CheckCheck className="w-4 h-4 text-slate-500" />
              <span>Tout marquer comme lu</span>
            </button>
          )}

          {canCreate && (
            <button
              id="btn-open-create-announcement"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition transform active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nouvelle Annonce</span>
            </button>
          )}
        </div>
      </div>

      {/* Strict Data Isolation Banner for Reps and Residents */}
      {(isBlockScoped || isResidentScoped) && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Filtrage de Confidentialité Actif • Espace Bloc {myBlockCode}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Vous recevez les annonces globales de la résidence et exclusivement celles relatives à votre bâtiment (Bloc {myBlockCode}). Les travaux internes des 8 autres blocs sont strictement cloisonnés.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/60 text-emerald-300 border border-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Étanche
          </span>
        </div>
      )}

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par titre, contenu, auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scope Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setScopeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                scopeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes ({visibleAnnouncements.length})
            </button>
            <button
              onClick={() => setScopeFilter('residence')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                scopeFilter === 'residence'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 Résidence
            </button>
            <button
              onClick={() => setScopeFilter('my_block')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                scopeFilter === 'my_block'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 {isBlockScoped || isResidentScoped ? `Bloc ${myBlockCode}` : 'Blocs'}
            </button>
          </div>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Priorité :
          </span>
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              priorityFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous niveaux
          </button>
          <button
            onClick={() => setPriorityFilter('urgent')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              priorityFilter === 'urgent'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Urgentes</span>
          </button>
          <button
            onClick={() => setPriorityFilter('works')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              priorityFilter === 'works'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Wrench className="w-3 h-3" />
            <span>Travaux</span>
          </button>
          <button
            onClick={() => setPriorityFilter('info')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              priorityFilter === 'info'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>Informations</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 text-xs">
          Aucune communication ne correspond à vos filtres.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isRead={readAnnouncementIds.includes(announcement.id)}
              onMarkAsRead={markAnnouncementAsRead}
            />
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {canCreate && (
        <CreateAnnouncementModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};
