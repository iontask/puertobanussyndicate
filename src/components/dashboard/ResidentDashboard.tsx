import React from 'react';
import { ViewKey } from '../../types';
import { UnifiedResidentPortal } from '../portal/UnifiedResidentPortal';

interface ResidentDashboardProps {
  onNavigate: (view: ViewKey) => void;
  onOpenNewComplaint: () => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  onNavigate,
  onOpenNewComplaint,
}) => {
  return (
    <UnifiedResidentPortal
      onOpenNewComplaint={onOpenNewComplaint}
      onNavigateToView={(v) => onNavigate(v as ViewKey)}
    />
  );
};

