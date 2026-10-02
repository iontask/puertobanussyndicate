import {
  NotificationChannel,
  NotificationEventType,
  NotificationLogEntry,
  NotificationPreference,
} from '../../types';
import { renderTemplate } from './notificationTemplates';

export interface NotificationPayload {
  tenantId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  eventType: NotificationEventType;
  variables: Record<string, string | number>;
  language?: 'fr' | 'ar' | 'en';
}

export interface ProviderSendResult {
  channel: NotificationChannel;
  success: boolean;
  messageId: string;
  timestamp: string;
  error?: string;
}

export interface NotificationProvider {
  channel: NotificationChannel;
  send(
    to: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>
  ): Promise<ProviderSendResult>;
}

/**
 * SendGrid Email Provider (RFC 5322 / Web API v3)
 */
export class SendGridEmailProvider implements NotificationProvider {
  channel: NotificationChannel = 'email';

  async send(
    to: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>
  ): Promise<ProviderSendResult> {
    // Simulation réaliste de l'appel SendGrid v3 /mail/send
    await new Promise((res) => setTimeout(res, 250));

    return {
      channel: 'email',
      success: true,
      messageId: `sg-msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Twilio SMS Provider (REST API)
 */
export class TwilioSMSProvider implements NotificationProvider {
  channel: NotificationChannel = 'sms';

  async send(
    to: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>
  ): Promise<ProviderSendResult> {
    await new Promise((res) => setTimeout(res, 300));

    return {
      channel: 'sms',
      success: true,
      messageId: `SM${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * WhatsApp Business API Provider (Meta Cloud API / Twilio WhatsApp)
 */
export class WhatsAppBusinessProvider implements NotificationProvider {
  channel: NotificationChannel = 'whatsapp';

  async send(
    to: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>
  ): Promise<ProviderSendResult> {
    await new Promise((res) => setTimeout(res, 350));

    return {
      channel: 'whatsapp',
      success: true,
      messageId: `wamid.HBgL${Math.random().toString(36).substring(2, 12)}==`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * In-App Notification Provider
 */
export class InAppNotificationProvider implements NotificationProvider {
  channel: NotificationChannel = 'in_app';

  async send(
    to: string,
    subject: string,
    body: string,
    metadata?: Record<string, any>
  ): Promise<ProviderSendResult> {
    return {
      channel: 'in_app',
      success: true,
      messageId: `inapp-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}

const NOTIF_LOGS_KEY = 'syndikal_notification_logs_v1';
const NOTIF_PREFS_KEY = 'syndikal_notification_prefs_v1';

export class MultiChannelNotificationService {
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();
  private logs: NotificationLogEntry[] = [];
  private preferences: Map<string, NotificationPreference> = new Map();
  private listeners: Array<(logs: NotificationLogEntry[]) => void> = [];

  constructor() {
    // Enregistrement des providers par défaut
    this.providers.set('email', new SendGridEmailProvider());
    this.providers.set('sms', new TwilioSMSProvider());
    this.providers.set('whatsapp', new WhatsAppBusinessProvider());
    this.providers.set('in_app', new InAppNotificationProvider());

    this.loadLogs();
  }

  private loadLogs() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(NOTIF_LOGS_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      } else {
        // Exemples initiaux pour pré-remplir l'historique
        this.logs = [
          {
            id: 'notif-demo-1',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            tenantId: 'tenant-pb-01',
            recipientName: 'Omar Benjelloun (H-12)',
            recipientContact: '+212 6 61 23 45 67',
            channel: 'whatsapp',
            eventType: 'overdue_fee',
            subject: 'Rappel d’échéance — Cotisation Copropriété H-12',
            body: 'Cher(e) Omar Benjelloun, nous vous informons que votre appel de fonds de 450 MAD pour le lot H-12 arrive à échéance le 15/09/2026.',
            status: 'delivered',
            providerMessageId: 'wamid.HBgL8291039==',
            language: 'fr',
          },
          {
            id: 'notif-demo-2',
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            tenantId: 'tenant-pb-01',
            recipientName: 'Tous résidents Bloc H',
            recipientContact: 'Liste de diffusion email',
            channel: 'email',
            eventType: 'urgent_block_alert',
            subject: 'URGENCE TECHNIQUE — Bloc H (Coupure Eau Chaude Sanitaire)',
            body: 'Intervention sur surpresseur en cours. Durée estimée 2 heures.',
            status: 'sent',
            providerMessageId: 'sg-msg-9182371',
            language: 'fr',
          },
        ];
        this.saveLogs();
      }
    } catch (e) {
      console.warn('Failed to load notification logs', e);
    }
  }

  private saveLogs() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(NOTIF_LOGS_KEY, JSON.stringify(this.logs));
      this.listeners.forEach((cb) => cb([...this.logs]));
    } catch (e) {
      console.warn('Failed to save notification logs', e);
    }
  }

  public subscribeLogs(callback: (logs: NotificationLogEntry[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public getLogs(): NotificationLogEntry[] {
    return [...this.logs];
  }

  public getUserPreferences(userId: string): NotificationPreference {
    if (this.preferences.has(userId)) {
      return this.preferences.get(userId)!;
    }

    // Default preference: all channels active
    const defaultPref: NotificationPreference = {
      userId,
      emailEnabled: true,
      smsEnabled: false,
      whatsappEnabled: true,
      inAppEnabled: true,
      verifiedEmail: 'resident@puertobanus.ma',
      verifiedPhone: '+212 6 61 88 99 00',
      channelsByEvent: {
        overdue_fee: ['whatsapp', 'email', 'in_app'],
        urgent_block_alert: ['whatsapp', 'sms', 'in_app'],
        ticket_resolved: ['email', 'in_app'],
        announcement_general: ['email', 'in_app'],
      },
    };

    this.preferences.set(userId, defaultPref);
    return defaultPref;
  }

  public saveUserPreferences(userId: string, prefs: NotificationPreference) {
    this.preferences.set(userId, prefs);
  }

  /**
   * Envoi d'une notification multicanale distribuée selon les préférences
   */
  public async dispatchNotification(
    payload: NotificationPayload,
    forcedChannels?: NotificationChannel[]
  ): Promise<ProviderSendResult[]> {
    const prefs = this.getUserPreferences(payload.recipientId);
    const targetChannels =
      forcedChannels || prefs.channelsByEvent[payload.eventType] || ['in_app'];

    const lang = payload.language || 'fr';
    const { subject, body } = renderTemplate(payload.eventType, lang, payload.variables);

    const results: ProviderSendResult[] = [];

    for (const channel of targetChannels) {
      const provider = this.providers.get(channel);
      if (!provider) continue;

      let destination = '';
      if (channel === 'email') destination = payload.recipientEmail || prefs.verifiedEmail || '';
      else if (channel === 'whatsapp' || channel === 'sms')
        destination = payload.recipientPhone || prefs.verifiedPhone || '';
      else destination = payload.recipientName;

      try {
        const result = await provider.send(destination, subject, body, {
          eventType: payload.eventType,
        });
        results.push(result);

        // Ajout au log
        const logEntry: NotificationLogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          tenantId: payload.tenantId,
          recipientName: payload.recipientName,
          recipientContact: destination || 'In-App Direct',
          channel,
          eventType: payload.eventType,
          subject,
          body,
          status: result.success ? 'delivered' : 'failed',
          providerMessageId: result.messageId,
          language: lang,
        };

        this.logs.unshift(logEntry);
      } catch (err: any) {
        results.push({
          channel,
          success: false,
          messageId: '',
          timestamp: new Date().toISOString(),
          error: err?.message || 'Erreur d’envoi',
        });
      }
    }

    this.saveLogs();
    return results;
  }

  public clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

export const notificationService = new MultiChannelNotificationService();
