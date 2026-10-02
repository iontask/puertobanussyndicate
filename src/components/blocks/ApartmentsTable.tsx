import React, { useState, useMemo } from 'react';
import { Apartment } from '../../types';
import { Search, Filter, Home, ChevronLeft, ChevronRight, Phone, UserCheck } from 'lucide-react';

interface ApartmentsTableProps {
  apartments: Apartment[];
  blockName: string;
  totalApartmentsCount: number;
}

export const ApartmentsTable: React.FC<ApartmentsTableProps> = ({
  apartments,
  blockName,
  totalApartmentsCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [residentTypeFilter, setResidentTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Filtrage
  const filteredApartments = useMemo(() => {
    return apartments.filter((apt) => {
      const matchesSearch =
        apt.doorNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.contactPhone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFloor =
        floorFilter === 'all' || apt.floor.toString() === floorFilter;

      const matchesType =
        residentTypeFilter === 'all' || apt.residentType === residentTypeFilter;

      return matchesSearch && matchesFloor && matchesType;
    });
  }, [apartments, searchQuery, floorFilter, residentTypeFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, floorFilter, residentTypeFilter]);

  // Pagination calculée
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage) || 1;
  const paginatedApartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApartments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApartments, currentPage, itemsPerPage]);

  return (
    <div className="space-y-3.5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
        <div>
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Home className="w-4 h-4 text-blue-600" />
            <span>Répertoire Cadastral des Lots ({totalApartmentsCount} Lots)</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Recherche par porte, nom de copropriétaire ou locataire
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (H-12, Tazi...)"
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 w-44"
            />
          </div>

          {/* Filtre étage */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tous les étages</option>
            <option value="0">RDC</option>
            <option value="1">1er Étage</option>
            <option value="2">2ème Étage</option>
            <option value="3">3ème Étage</option>
          </select>

          {/* Filtre type d'occupant */}
          <select
            value={residentTypeFilter}
            onChange={(e) => setResidentTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Tous statuts</option>
            <option value="owner">Propriétaire occupant</option>
            <option value="tenant">Locataire</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Porte</th>
                <th className="px-4 py-2.5">Étage</th>
                <th className="px-4 py-2.5">Copropriétaire Titulaire</th>
                <th className="px-4 py-2.5">Occupant Résident</th>
                <th className="px-4 py-2.5">Statut Occupation</th>
                <th className="px-4 py-2.5">Surface</th>
                <th className="px-4 py-2.5">Contact Téléphonique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedApartments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Aucun appartement ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                paginatedApartments.map((apt) => {
                  const isDemoH12 = apt.doorNumber === 'H-12';

                  return (
                    <tr
                      key={apt.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isDemoH12 ? 'bg-blue-50/80 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {apt.doorNumber}
                          </span>
                          {isDemoH12 && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white">
                              Démo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {apt.floor === 0 ? 'RDC' : `${apt.floor}er/ème étage`}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">
                        {apt.ownerName}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">
                        {apt.residentName}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            apt.residentType === 'owner'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {apt.residentType === 'owner' ? 'Propriétaire' : 'Locataire'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-medium">
                        {apt.surfaceM2} m²
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{apt.contactPhone}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">
            Affichage de{' '}
            <strong>
              {filteredApartments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            à{' '}
            <strong>
              {Math.min(currentPage * itemsPerPage, filteredApartments.length)}
            </strong>{' '}
            sur <strong>{filteredApartments.length}</strong> lots filtrés (Total bloc : {totalApartmentsCount})
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                currentPage === 1
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Précédent</span>
            </button>

            <span className="text-xs font-semibold px-2 text-slate-700">
              Page {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 ${
                currentPage === totalPages || totalPages === 0
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
