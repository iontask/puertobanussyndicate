import React, { useState, useEffect } from 'react';
import { offlineSyncService } from '../../services/offline/offlineSync';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncSuccess, setLastSyncSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleManualSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = offlineSyncService.subscribe((queue) => {
      const pending = queue.filter(
        (item) => item.syncStatus === 'pending' || item.syncStatus === 'failed'
      ).length;
      setPendingCount(pending);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    const result = await offlineSyncService.triggerSync();
    setIsSyncing(false);
    if (result.syncedCount > 0) {
      setLastSyncSuccess(true);
      setTimeout(() => setLastSyncSuccess(false), 3000);
    }
  };

  // Rien à afficher si tout est connecté et aucune action en attente
  if (isOnline && pendingCount === 0 && !lastSyncSuccess) {
    return null;
  }

  return (
    <div
      id="pwa-offline-status-banner"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-xs transition-all border animate-in fade-in slide-in-from-bottom-2 bg-white text-slate-800 border-slate-200"
    >
      {!isOnline ? (
        <>
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Mode Hors-Ligne (Terrain)</span>
          </div>
          {pendingCount > 0 && (
            <span className="text-slate-500 text-[11px]">
              {pendingCount} relevé{pendingCount > 1 ? 's' : ''} en attente
            </span>
          )}
        </>
      ) : lastSyncSuccess ? (
        <div className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Synchronisation terrain réussie</span>
        </div>
      ) : (
        <>
          <span className="text-slate-600">
            {pendingCount} action{pendingCount > 1 ? 's' : ''} terrain en attente
          </span>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer font-bold disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser'}</span>
          </button>
        </>
      )}
    </div>
  );
};
