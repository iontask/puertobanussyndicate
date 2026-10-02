import { NotificationEventType } from '../../types';

export interface MessageTemplate {
  subject: {
    fr: string;
    ar: string;
    en: string;
  };
  body: {
    fr: string;
    ar: string;
    en: string;
  };
}

export const NOTIFICATION_TEMPLATES: Record<NotificationEventType, MessageTemplate> = {
  overdue_fee: {
    subject: {
      fr: 'Rappel d’échéance — Cotisation Copropriété {apartmentDoor}',
      ar: 'تذكير بموعد أداء واجبات السنديك — الشقة {apartmentDoor}',
      en: 'Payment Reminder — HOA Contribution {apartmentDoor}',
    },
    body: {
      fr: 'Cher(e) {residentName}, nous vous informons que votre appel de fonds d’un montant de {amountMAD} MAD pour le lot {apartmentDoor} arrive à échéance le {dueDate}. Nous vous remercions pour votre prompt règlement.',
      ar: 'عزيزي/عزيزتي {residentName}، نود تذكيركم بأن واجبات السنديك المستحقة بمبلغ {amountMAD} درهم لشقتكم رقم {apartmentDoor} تحل بتاريخ {dueDate}. نشكر لكم حسن تعاونكم.',
      en: 'Dear {residentName}, this is a friendly reminder that your HOA fee of {amountMAD} MAD for apartment {apartmentDoor} is due on {dueDate}. Thank you for your prompt settlement.',
    },
  },

  urgent_block_alert: {
    subject: {
      fr: 'URGENCE TECHNIQUE — Bloc {blockCode} ({issueType})',
      ar: 'تنبيه طارئ — عمارة {blockCode} ({issueType})',
      en: 'URGENT NOTICE — Block {blockCode} ({issueType})',
    },
    body: {
      fr: 'Alerte technique sur le Bloc {blockCode} : {issueType}. Une équipe d’intervention est mobilisée. Durée estimée de l’interruption : {estimatedDuration}. Consignes prioritaires : {instructions}.',
      ar: 'تنبيه طارئ بخصوص عمارة {blockCode}: {issueType}. فريق الصيانة يتدخل ميدانياً. المدة المقدرة للتدخل: {estimatedDuration}. التعليمات: {instructions}.',
      en: 'Urgent notice regarding Block {blockCode}: {issueType}. A specialized maintenance team is on site. Estimated duration: {estimatedDuration}. Instructions: {instructions}.',
    },
  },

  ticket_resolved: {
    subject: {
      fr: 'Résolution de votre réclamation #{ticketId}',
      ar: 'معالجة الشكاية رقم #{ticketId}',
      en: 'Your Ticket #{ticketId} has been Resolved',
    },
    body: {
      fr: 'Bonjour {residentName}, nous avons le plaisir de vous informer que votre signalement #{ticketId} a été traité et résolu avec succès. Rapport de clôture : {resolutionNotes}.',
      ar: 'مرحباً {residentName}، يسعدنا إعلامكم بأن شكايتكم رقم #{ticketId} قد تمت معالجتها وإغلاقها بنجاح. تقرير الإنجاز: {resolutionNotes}.',
      en: 'Hello {residentName}, we are pleased to inform you that your ticket #{ticketId} has been successfully resolved. Resolution summary: {resolutionNotes}.',
    },
  },

  announcement_general: {
    subject: {
      fr: 'Communication du Conseil Syndical : {title}',
      ar: 'بلاغ من مجلس السنديك: {title}',
      en: 'Official HOA Notice: {title}',
    },
    body: {
      fr: 'Une nouvelle communication officielle a été publiée pour votre résidence : "{title}". Consultez l’intégralité des pièces sur votre portail Syndikal.',
      ar: 'تم نشر بلاغ رسمي جديد يهم مجمعكم السكني: "{title}". يرجى الاطلاع على التفاصيل الكاملة عبر تطبيق سنديكال.',
      en: 'A new official notice has been published for your residence: "{title}". Check your Syndikal portal for full details.',
    },
  },
};

/**
 * Remplace les variables paramétriques dans un template
 */
export function renderTemplate(
  eventType: NotificationEventType,
  language: 'fr' | 'ar' | 'en',
  variables: Record<string, string | number>
): { subject: string; body: string } {
  const template = NOTIFICATION_TEMPLATES[eventType];
  if (!template) {
    return {
      subject: 'Notification Syndikal',
      body: 'Message automatique de votre copropriété.',
    };
  }

  let subject = template.subject[language] || template.subject.fr;
  let body = template.body[language] || template.body.fr;

  Object.entries(variables).forEach(([key, val]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    subject = subject.replace(regex, String(val));
    body = body.replace(regex, String(val));
  });

  return { subject, body };
}
