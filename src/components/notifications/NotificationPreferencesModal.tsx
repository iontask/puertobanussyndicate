import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  notificationService,
  NotificationPayload,
} from '../../services/notifications/notificationProviders';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationLogEntry,
  NotificationPreference,
} from '../../types';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Send,
  History,
  X,
  ShieldCheck,
  Globe,
  Settings,
} from 'lucide-react';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, currentTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'preferences' | 'tester' | 'history'>('preferences');

  const [prefs, setPrefs] = useState<NotificationPreference>(() =>
    notificationService.getUserPreferences(currentUser.id)
  );
  const [logs, setLogs] = useState<NotificationLogEntry[]>(() => notificationService.getLogs());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Tester state
  const [testEventType, setTestEventType] = useState<NotificationEventType>('overdue_fee');
  const [testChannel, setTestChannel] = useState<NotificationChannel>('whatsapp');
  const [testLanguage, setTestLanguage] = useState<'fr' | 'ar' | 'en'>('fr');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const unsub = notificationService.subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const toggleEventChannel = (eventType: NotificationEventType, channel: NotificationChannel) => {
    const currentList = prefs.channelsByEvent[eventType] || [];
    const exists = currentList.includes(channel);
    const updated = exists
      ? currentList.filter((c) => c !== channel)
      : [...currentList, channel];

    setPrefs({
      ...prefs,
      channelsByEvent: {
        ...prefs.channelsByEvent,
        [eventType]: updated,
      },
    });
  };

  const handleSavePreferences = () => {
    notificationService.saveUserPreferences(currentUser.id, prefs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    const testPayload: NotificationPayload = {
      tenantId: currentTenant.id,
      recipientId: currentUser.id,
      recipientName: currentUser.name,
      recipientEmail: prefs.verifiedEmail || 'test@copro.ma',
      recipientPhone: prefs.verifiedPhone || '+212 6 61 23 45 67',
      eventType: testEventType,
      language: testLanguage,
      variables: {
        residentName: currentUser.name,
        apartmentDoor: 'H-12',
        amountMAD: '450',
        dueDate: '30/09/2026',
        blockCode: 'H',
        issueType: 'Coupure d’eau générale',
        estimatedDuration: '1h30',
        instructions: 'Vannes fermées pour remplacement clapet anti-retour',
        ticketId: 'REC-2026-089',
        resolutionNotes: 'Remplacement du spot LED étanche terminé',
        title: 'Convocation Assemblée Générale Ordinaire 2026',
      },
    };

    try {
      const results = await notificationService.dispatchNotification(testPayload, [testChannel]);
      const success = results.every((r) => r.success);
      setTestResult({
        success,
        message: success
          ? `Notification transmise avec succès sur le canal ${testChannel.toUpperCase()} (ID: ${results[0]?.messageId})`
          : 'Échec de la transmission du message',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erreur d’expédition',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Centre de Notifications Multicanal</h3>
              <p className="text-xs text-slate-400">
                SendGrid (Email) • Twilio (SMS) • Meta Cloud API (WhatsApp)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Mes Canaux Préférés</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'tester'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulateur & Test d'Envoi</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique des Envois ({logs.length})</span>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Coordonnées vérifiées */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Coordonnées de Réception
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email vérifié (SendGrid)
                    </label>
                    <input
                      type="email"
                      value={prefs.verifiedEmail || ''}
                      onChange={(e) => setPrefs({ ...prefs, verifiedEmail: e.target.value })}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                      placeholder="votre.email@domaine.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Téléphone WhatsApp & SMS (Format E.164)
                    </label>
                    <input
                      type="text"
                      value={prefs.verifiedPhone || ''}
                      onChange={(e) => setPrefs({ ...prefs, verifiedPhone: e.target.value })}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono"
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </div>
                </div>
              </div>

              {/* Matrice Canaux x Evénements */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Distribution par Type d'Événement
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {/* Event 1: Impayé */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Rappel d’échéance & Cotisation
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Appel de fonds mensuel ou trimestriel, rappel amical avant relance
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['whatsapp', 'email', 'in_app', 'sms'] as NotificationChannel[]).map(
                        (ch) => {
                          const active = prefs.channelsByEvent.overdue_fee?.includes(ch);
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => toggleEventChannel('overdue_fee', ch)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                active
                                  ? ch === 'whatsapp'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : ch === 'email'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                              }`}
                            >
                              {ch === 'whatsapp' ? 'WhatsApp' : ch === 'email' ? 'Email' : ch === 'sms' ? 'SMS' : 'In-App'}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Event 2: Alerte Urgente Bloc */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Alerte Urgence Bloc ou Bassin
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Coupure technique, fermeture de piscine, intervention plomberie immédiate
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['whatsapp', 'sms', 'in_app', 'email'] as NotificationChannel[]).map(
                        (ch) => {
                          const active = prefs.channelsByEvent.urgent_block_alert?.includes(ch);
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => toggleEventChannel('urgent_block_alert', ch)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                active
                                  ? ch === 'whatsapp'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : ch === 'sms'
                                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                                    : 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                              }`}
                            >
                              {ch === 'whatsapp' ? 'WhatsApp' : ch === 'email' ? 'Email' : ch === 'sms' ? 'SMS' : 'In-App'}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Event 3: Résolution Réclamation */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Résolution d'une Réclamation
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Rapport d'intervention et confirmation de clôture de votre ticket
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['whatsapp', 'email', 'in_app'] as NotificationChannel[]).map((ch) => {
                        const active = prefs.channelsByEvent.ticket_resolved?.includes(ch);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => toggleEventChannel('ticket_resolved', ch)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                              active
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                            }`}
                          >
                            {ch === 'whatsapp' ? 'WhatsApp' : ch === 'email' ? 'Email' : 'In-App'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Event 4: Annonce Générale */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Annonces Officielles de Copropriété
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Ordre du jour d'AG, comptes-rendus, travaux votés
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['email', 'in_app'] as NotificationChannel[]).map((ch) => {
                        const active = prefs.channelsByEvent.announcement_general?.includes(ch);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => toggleEventChannel('announcement_general', ch)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                              active
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                            }`}
                          >
                            {ch === 'email' ? 'Email' : 'In-App'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {savedSuccess ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Préférences enregistrées avec succès !
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Ces réglages s'appliquent immédiatement à votre profil.
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  Enregistrer mes préférences
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TESTER */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900">
                <p className="font-semibold mb-1">Simulateur d'Envoi Multicanal en Direct</p>
                <p className="text-blue-700">
                  Déclenchez une notification de test pour vérifier la génération des modèles paramétrables, la traduction dynamique FR/AR et l'accusé de réception des passerelles API.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type d'Événement
                  </label>
                  <select
                    value={testEventType}
                    onChange={(e) => setTestEventType(e.target.value as NotificationEventType)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="overdue_fee">Rappel de Cotisation</option>
                    <option value="urgent_block_alert">Alerte Urgente Bloc</option>
                    <option value="ticket_resolved">Ticket Résolu</option>
                    <option value="announcement_general">Annonce Générale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Canal d'Envoi
                  </label>
                  <select
                    value={testChannel}
                    onChange={(e) => setTestChannel(e.target.value as NotificationChannel)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="whatsapp">WhatsApp Business API</option>
                    <option value="email">SendGrid v3 (Email)</option>
                    <option value="sms">Twilio SMS Gateway</option>
                    <option value="in_app">In-App Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Langue du Message
                  </label>
                  <select
                    value={testLanguage}
                    onChange={(e) => setTestLanguage(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="fr">Français (FR)</option>
                    <option value="ar">العربية (AR) - RTL</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Destinataire du Test
                </p>
                <div className="text-xs text-slate-700 flex flex-wrap gap-4">
                  <span><strong>Nom :</strong> {currentUser.name}</span>
                  <span><strong>Email :</strong> {prefs.verifiedEmail || 'test@copro.ma'}</span>
                  <span><strong>Tél :</strong> {prefs.verifiedPhone || '+212 6 61 23 45 67'}</span>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendTestNotification}
                disabled={isSendingTest}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-2xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
                <span>{isSendingTest ? 'Expédition en cours via la passerelle...' : 'Envoyer la notification de test'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Journal d'audit des messages envoyés par la plateforme
                </p>
                <button
                  onClick={() => notificationService.clearLogs()}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Effacer l'historique
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Aucun message envoyé pour le moment.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              log.channel === 'whatsapp'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.channel === 'email'
                                ? 'bg-blue-100 text-blue-800'
                                : log.channel === 'sms'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {log.channel}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {log.recipientName}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({log.recipientContact})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {log.subject && (
                        <p className="font-bold text-slate-900 text-xs">{log.subject}</p>
                      )}

                      <p
                        className={`text-slate-600 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 ${
                          log.language === 'ar' ? 'text-right font-arabic' : ''
                        }`}
                        dir={log.language === 'ar' ? 'rtl' : 'ltr'}
                      >
                        {log.body}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="font-mono">ID: {log.providerMessageId || log.id}</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Acheminé avec succès
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
