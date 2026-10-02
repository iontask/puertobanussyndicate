import React, { useMemo } from 'react';
import { Block, BlockRepresentativeInfo, Apartment } from '../../types';
import { useResidence } from '../../context/ResidenceContext';
import { BlockEquipmentsSection } from './BlockEquipmentsSection';
import { ApartmentsTable } from './ApartmentsTable';
import {
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  Home,
  CheckCircle2,
  AlertTriangle,
  Waves,
} from 'lucide-react';

interface BlockDetailViewProps {
  block: Block;
  representative?: BlockRepresentativeInfo;
}

export const BlockDetailView: React.FC<BlockDetailViewProps> = ({
  block,
  representative,
}) => {
  const { apartmentsBlockH, getPoolsForBlock, getComplaintsForBlock } = useResidence();

  const pools = getPoolsForBlock(block.id);
  const complaints = getComplaintsForBlock(block.id);
  const activeComplaints = complaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  );

  // If Bloc H, use real mock apartments (76 items)
  // For other blocks, dynamically build structured lots
  const apartments: Apartment[] = useMemo(() => {
    if (block.code === 'H') {
      return apartmentsBlockH;
    }

    const firstNames = [
      'Mohamed',
      'Fatima',
      'Youssef',
      'Khadija',
      'Mehdi',
      'Nadia',
      'Amine',
      'Souad',
      'Tarik',
      'Leila',
      'Rachid',
      'Zineb',
      'Adil',
      'Mouna',
      'Karim',
      'Siham',
      'Hamza',
      'Salma',
      'Hicham',
      'Ghita',
    ];
    const lastNames = [
      'El Fassi',
      'Bennani',
      'Alaoui',
      'Chraibi',
      'Tazi',
      'Idrissi',
      'Berrada',
      'Benjelloun',
      'Mansouri',
      'Filali',
      'Kabbaj',
      'Bennis',
      'Slaoui',
      'Tahiri',
      'Ouazzani',
    ];

    const count = block.apartmentCount;
    const generated: Apartment[] = [];

    for (let i = 1; i <= count; i++) {
      const floor = Math.floor((i - 1) / 14);
      const doorNumber = `${block.code}-${i < 10 ? '0' + i : i}`;
      const fName = firstNames[(i * 3) % firstNames.length];
      const lName = lastNames[(i * 5) % lastNames.length];
      const isOwner = i % 4 !== 0;

      generated.push({
        id: `apt-${block.code.toLowerCase()}-${i}`,
        tenantId: block.tenantId,
        blockId: block.id,
        doorNumber,
        floor: Math.min(floor, 3),
        surfaceM2: 95 + ((i * 7) % 45),
        residentType: isOwner ? 'owner' : 'tenant',
        ownerName: `${fName} ${lName}`,
        residentName: isOwner ? `${fName} ${lName}` : `Locataire (${fName} ${lName})`,
        contactPhone: `+212 6 61 ${String(10 + (i % 89)).padStart(2, '0')} ${String(
          20 + (i % 79)
        ).padStart(2, '0')} ${String(30 + (i % 69)).padStart(2, '0')}`,
        contactEmail: `${fName.toLowerCase()}.${lName.toLowerCase()}@gmail.com`,
      });
    }

    return generated;
  }, [block, apartmentsBlockH]);

  const ownerCount = apartments.filter((a) => a.residentType === 'owner').length;
  const tenantCount = apartments.filter((a) => a.residentType === 'tenant').length;
  const occupancyRate = Math.round((ownerCount / apartments.length) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Fiche d'identité générale du bâtiment */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-sm">
              {block.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {block.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {block.apartmentCount} Lots Cadastrés
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Résidence Puerto Banus • Bâtiment {block.floorsCount} niveaux (RDC, 1er, 2ème, 3ème étage) • 2 Piscines dédiées
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Taux Propriétaires</span>
              <span className="font-bold text-slate-900">{occupancyRate}% ({ownerCount} lots)</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Taux Locataires</span>
              <span className="font-bold text-slate-900">{100 - occupancyRate}% ({tenantCount} lots)</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Incidents Ouverts</span>
              <span className={`font-bold ${activeComplaints.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {activeComplaints.length} Réclamation{activeComplaints.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Représentant officiel du bloc */}
        <div className="pt-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                {representative?.name
                  ? representative.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                  : block.code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {representative?.name || 'Représentant en cours de désignation'}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    Mandat Élu
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mandat {representative?.mandatePeriod || '2025 - 2027'}</span>
                  <span>•</span>
                  <span>Élu en Assemblée Générale</span>
                </p>
              </div>
            </div>

            {representative && (
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{representative.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{representative.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Section dédiée aux équipements du bloc */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
        <BlockEquipmentsSection block={block} />
      </div>

      {/* 4. Liste paginée/filtrable des appartements */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
        <ApartmentsTable
          apartments={apartments}
          blockName={block.name}
          totalApartmentsCount={block.apartmentCount}
        />
      </div>
    </div>
  );
};
