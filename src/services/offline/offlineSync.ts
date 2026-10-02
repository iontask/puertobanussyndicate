import { OfflineSyncAction, OfflineActionType, UserRole } from '../../types';

const OFFLINE_QUEUE_KEY = 'syndikal_offline_sync_queue_v1';

class OfflineSyncService {
  private queue: OfflineSyncAction[] = [];
  private listeners: Array<(queue: OfflineSyncAction[]) => void> = [];
  private isSyncing = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.triggerSync();
      });
    }
  }

  private loadQueue() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load offline queue from localStorage', e);
      this.queue = [];
    }
  }

  private saveQueue() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (e) {
      console.warn('Failed to save offline queue to localStorage', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.queue]));
  }

  public subscribe(callback: (queue: OfflineSyncAction[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.queue]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public getQueue(): OfflineSyncAction[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'failed').length;
  }

  /**
   * Enregistre une action terrain résiliente (contrôle piscine, passage prestataire, ticket)
   */
  public enqueueAction(params: {
    type: OfflineActionType;
    tenantId: string;
    authorName: string;
    authorRole: UserRole;
    data: Record<string, any>;
  }): OfflineSyncAction {
    const action: OfflineSyncAction = {
      id: `offline-act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: params.type,
      timestamp: new Date().toISOString(),
      tenantId: params.tenantId,
      authorName: params.authorName,
      authorRole: params.authorRole,
      data: params.data,
      syncStatus: 'pending',
      retryCount: 0,
    };

    this.queue.unshift(action);
    this.saveQueue();

    // Si on est en ligne, on tente la synchro directement
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setTimeout(() => this.triggerSync(), 200);
    }

    return action;
  }

  /**
   * Exécute la synchronisation de toutes les actions en attente
   */
  public async triggerSync(
    customHandler?: (action: OfflineSyncAction) => Promise<boolean>
  ): Promise<{ syncedCount: number; failedCount: number }> {
    if (this.isSyncing) return { syncedCount: 0, failedCount: 0 };
    this.isSyncing = true;

    let syncedCount = 0;
    let failedCount = 0;

    const updatedQueue: OfflineSyncAction[] = [];

    for (const item of this.queue) {
      if (item.syncStatus === 'synced') {
        continue; // Nettoyé lors de la synchro
      }

      item.syncStatus = 'syncing';
      this.notifyListeners();

      try {
        let success = true;
        if (customHandler) {
          success = await customHandler(item);
        } else {
          // Simulation délai réseau réaliste
          await new Promise((res) => setTimeout(res, 600));
          success = true;
        }

        if (success) {
          item.syncStatus = 'synced';
          syncedCount++;
        } else {
          item.syncStatus = 'failed';
          item.retryCount = (item.retryCount || 0) + 1;
          item.error = 'Erreur lors de la synchronisation au serveur';
          failedCount++;
          updatedQueue.push(item);
        }
      } catch (err: any) {
        item.syncStatus = 'failed';
        item.retryCount = (item.retryCount || 0) + 1;
        item.error = err?.message || 'Erreur réseau';
        failedCount++;
        updatedQueue.push(item);
      }
    }

    this.queue = updatedQueue;
    this.saveQueue();
    this.isSyncing = false;

    return { syncedCount, failedCount };
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineSyncService = new OfflineSyncService();
