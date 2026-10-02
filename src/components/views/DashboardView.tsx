import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ViewKey } from '../../types';
import { PresidentDashboard } from '../dashboard/PresidentDashboard';
import { BlockRepDashboard } from '../dashboard/BlockRepDashboard';
import { ResidentDashboard } from '../dashboard/ResidentDashboard';

interface DashboardViewProps {
  onNavigate: (view: ViewKey) => void;
  onOpenNewComplaint: () => void;
  onSelectBlock?: (blockCode: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewComplaint,
  onSelectBlock,
}) => {
  const { currentUser } = useAuth();

  switch (currentUser.role) {
    case 'resident':
      return (
        <ResidentDashboard
          onNavigate={onNavigate}
          onOpenNewComplaint={onOpenNewComplaint}
        />
      );

    case 'block_rep':
      return (
        <BlockRepDashboard
          onNavigate={onNavigate}
          onOpenNewComplaint={onOpenNewComplaint}
        />
      );

    case 'president':
    case 'treasurer':
    default:
      return (
        <PresidentDashboard
          onNavigate={onNavigate}
          onSelectBlock={onSelectBlock}
        />
      );
  }
};
