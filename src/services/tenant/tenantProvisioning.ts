import {
  Tenant,
  Block,
  Apartment,
  Pool,
  User,
  OnboardingTenantData,
  CommonLightingItem,
} from '../../types';

export interface ProvisionedTenantResult {
  tenant: Tenant;
  blocks: Block[];
  apartments: Apartment[];
  pools: Pool[];
  users: User[];
  lighting: CommonLightingItem[];
}

export function provisionNewTenant(data: OnboardingTenantData): ProvisionedTenantResult {
  const tenantId = `tenant-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`;
  const tenantCode = data.code.toUpperCase().trim();

  // 1. Tenant object
  const tenant: Tenant = {
    id: tenantId,
    name: data.name.trim(),
    code: tenantCode,
    currency: data.currency || 'MAD',
    createdAt: new Date().toISOString(),
    address: data.address.trim(),
    city: data.city.trim(),
    totalBlocks: data.blockCount,
    totalPools: data.blockCount * data.poolsPerBlock,
    totalApartments: data.blockCount * data.floorsPerBlock * data.doorsPerFloor,
    status: 'active',
    themeColor: data.themeColor || '#2563eb',
    logoUrl: data.logoUrl,
  };

  // 2. Generate Blocks
  const blocks: Block[] = [];
  const apartments: Apartment[] = [];
  const pools: Pool[] = [];
  const lighting: CommonLightingItem[] = [];

  const totalApartmentsCount = data.blockCount * data.floorsPerBlock * data.doorsPerFloor;
  // Répartition des 10 000 tantièmes
  const baseTantiemes = Math.floor(10000 / totalApartmentsCount);
  const remainderTantiemes = 10000 - baseTantiemes * totalApartmentsCount;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let bIndex = 0; bIndex < data.blockCount; bIndex++) {
    const blockLetter =
      data.blockNamingMode === 'custom' && data.customBlockNames?.[bIndex]
        ? data.customBlockNames[bIndex]
        : alphabet[bIndex % alphabet.length];

    const blockId = `block-${tenantCode.toLowerCase()}-${blockLetter.toLowerCase()}`;

    const block: Block = {
      id: blockId,
      tenantId,
      name: `Bloc ${blockLetter}`,
      code: blockLetter as any,
      representativeUserId: `usr-${tenantCode.toLowerCase()}-rep-${blockLetter.toLowerCase()}`,
      apartmentCount: data.floorsPerBlock * data.doorsPerFloor,
      totalApartments: data.floorsPerBlock * data.doorsPerFloor,
      floorsCount: data.floorsPerBlock,
    };
    blocks.push(block);

    // Generate Apartments for this block
    let aptIndexInBlock = 1;
    for (let floor = 0; floor < data.floorsPerBlock; floor++) {
      for (let door = 1; door <= data.doorsPerFloor; door++) {
        const globalAptIndex = apartments.length;
        const doorNumber = floor === 0 ? `RDC-${door}` : `${floor}0${door}`;
        const aptId = `apt-${tenantCode.toLowerCase()}-${blockLetter.toLowerCase()}-${floor}-${door}`;

        // Surface estimée
        const surfaceM2 = 75 + ((door % 3) * 20);
        // Tantièmes
        const tantiemes = baseTantiemes + (globalAptIndex < remainderTantiemes ? 1 : 0);

        const apartment: Apartment = {
          id: aptId,
          tenantId,
          blockId,
          doorNumber: `${blockLetter}-${doorNumber}`,
          floor,
          surfaceM2,
          tantiemes,
          ownerName: `Propriétaire ${blockLetter}-${doorNumber}`,
          residentType: door % 4 === 0 ? 'tenant' : 'owner',
          residentName: `Copropriétaire ${blockLetter}-${doorNumber}`,
          contactPhone: `+212 6 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          contactEmail: `res.${blockLetter.toLowerCase()}${doorNumber.toLowerCase()}@${tenantCode.toLowerCase()}.ma`,
        };
        apartments.push(apartment);
        aptIndexInBlock++;
      }
    }

    // Generate Pools for this block
    for (let p = 1; p <= data.poolsPerBlock; p++) {
      const isChild = p === 2 && data.hasChildPools;
      const poolId = `pool-${tenantCode.toLowerCase()}-${blockLetter.toLowerCase()}-${p}`;

      const pool: Pool = {
        id: poolId,
        tenantId,
        blockId,
        name: isChild ? `Piscine Enfant Bloc ${blockLetter}` : `Piscine Principale Bloc ${blockLetter}`,
        type: isChild ? 'child' : 'adult',
        status: 'operational',
        lightingStatus: 'working',
        volumeM3: isChild ? 45 : 180,
        waterTemperatureC: 25,
        phLevel: 7.3,
        chlorinePpm: 1.4,
        lastCleanedAt: new Date().toISOString(),
      };
      pools.push(pool);
    }

    // Common lighting
    for (let l = 1; l <= 4; l++) {
      const zone: 'stairwells' | 'pool_surroundings' | 'hallways' | 'outdoor_paths' =
        l === 1 ? 'stairwells' : l === 2 ? 'hallways' : l === 3 ? 'pool_surroundings' : 'outdoor_paths';
      lighting.push({
        id: `light-${tenantCode.toLowerCase()}-${blockLetter.toLowerCase()}-${l}`,
        blockId,
        zone,
        label: l === 1 ? 'Cage d’escalier RDC' : l === 2 ? 'Hall d’entrée' : l === 3 ? 'Abords piscine' : 'Allée extérieure',
        workingBulbs: 4,
        totalBulbs: 4,
        status: 'working',
      });
    }
  }

  // 3. Initial Users (President & Treasurer)
  const users: User[] = [
    {
      id: `usr-${tenantCode.toLowerCase()}-pres`,
      tenantId,
      name: data.presidentName.trim() || 'Président Syndic',
      email: data.presidentEmail.trim() || `president@${tenantCode.toLowerCase()}.ma`,
      role: 'president',
      assignedApartmentId: apartments[0]?.id,
    },
    {
      id: `usr-${tenantCode.toLowerCase()}-tres`,
      tenantId,
      name: data.treasurerName.trim() || 'Trésorier Général',
      email: data.treasurerEmail.trim() || `tresorier@${tenantCode.toLowerCase()}.ma`,
      role: 'treasurer',
      assignedApartmentId: apartments[1]?.id,
    },
    {
      id: `usr-${tenantCode.toLowerCase()}-rep-a`,
      tenantId,
      name: `Représentant Bloc ${blocks[0]?.code || 'A'}`,
      email: `rep.${blocks[0]?.code?.toLowerCase() || 'a'}@${tenantCode.toLowerCase()}.ma`,
      role: 'block_rep',
      assignedBlockId: blocks[0]?.id,
      assignedApartmentId: apartments[2]?.id,
    },
    {
      id: `usr-${tenantCode.toLowerCase()}-res-1`,
      tenantId,
      name: `Résident ${apartments[3]?.doorNumber || 'A-101'}`,
      email: `resident@${tenantCode.toLowerCase()}.ma`,
      role: 'resident',
      assignedApartmentId: apartments[3]?.id,
      assignedBlockId: blocks[0]?.id,
    },
  ];

  return {
    tenant,
    blocks,
    apartments,
    pools,
    users,
    lighting,
  };
}
