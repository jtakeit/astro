/**
 * The booking form's words, per language, before the platform has spoken.
 *
 * These are a salon's. The words that depend on the kind of business —
 * «Записатися» or «Орендувати», «Майстер» or «Авто» — are the platform's, in
 * its availability answer (`words`), the kind's dictionary with the site's
 * own over it; the element hears them and replaces these. A site in a
 * language not here gets English, which the platform's answer then corrects
 * for the words it has.
 */

/** The languages the form carries words in. */
export const LOCALES = Object.freeze(['uk', 'de', 'en']);

const BASE = {
  uk: {
    service: 'Послуга', services: 'Послуги', total: 'Разом', pickService: 'Оберіть хоча б одну послугу.', resource: 'Майстер', any: 'Будь-хто', day: 'День', time: 'Час',
    name: "Ім'я", phone: 'Телефон', email: 'Електронна пошта', note: 'Коментар',
    book: 'Записатися', sending: 'Записуємо…', none: 'У цей день вільного часу немає.', noParty: 'Немає вільних місць для такої компанії.',
    pick: 'Оберіть день', confirmed: 'Ви записані.', pending: 'Запис отримано — ми підтвердимо його найближчим часом.',
    pay: 'Оплатити', payNote: 'Час зарезервовано на 30 хвилин. Щоб закріпити його, завершіть оплату.',
    manage: 'Скасувати або перенести запис', telegram: 'Нагадування в Telegram',
    taken: 'Цей час щойно зайняли — оберіть інший.', failed: 'Не вдалося записатися. Спробуйте ще раз або зателефонуйте.',
    back: 'До', length: 'Від {min} до {max} діб.', anyOf: 'Будь-яке вільне — {class}', noneOf: '{class} — немає вільних', notFor: '{who} — не для обраного', notForChosen: '{who} — не для обраного. Оберіть іншого або «{any}».', took: 'Ви берете: {what}',
    party: 'Скільки вас', hours: 'Скільки часу', hourShort: 'год', minuteShort: 'хв', challenge: 'Підтвердіть, що ви не робот, і спробуйте ще раз.', tooMany: 'У вас уже є кілька відкритих записів. Скасуйте один із них або зателефонуйте нам.',
    needContact: 'Вкажіть телефон або пошту, щоб ми могли з вами звʼязатися.', noScript: 'Онлайн-форма працює з увімкненим JavaScript — увімкніть його або зателефонуйте нам.',
  },
  de: {
    service: 'Leistung', services: 'Leistungen', total: 'Zusammen', pickService: 'Bitte mindestens eine Leistung wählen.', resource: 'Bei', any: 'Egal wer', day: 'Tag', time: 'Uhrzeit',
    name: 'Name', phone: 'Telefon', email: 'E-Mail', note: 'Bemerkung',
    book: 'Termin buchen', sending: 'Wird gebucht…', none: 'An diesem Tag ist nichts frei.', noParty: 'Für so viele Personen gibt es keinen freien Platz.',
    pick: 'Wählen Sie einen Tag', confirmed: 'Ihr Termin ist gebucht.', pending: 'Anfrage erhalten — wir bestätigen den Termin in Kürze.',
    pay: 'Jetzt bezahlen', payNote: 'Der Termin ist 30 Minuten reserviert. Schliessen Sie die Zahlung ab, um ihn zu behalten.',
    manage: 'Termin absagen oder verschieben', telegram: 'Erinnerungen per Telegram',
    taken: 'Diese Zeit wurde gerade vergeben — bitte wählen Sie eine andere.', failed: 'Die Buchung hat nicht geklappt. Bitte erneut versuchen oder anrufen.',
    back: 'Bis', length: 'Von {min} bis {max} Nächte.', anyOf: 'Beliebig frei — {class}', noneOf: '{class} — nichts verfügbar', notFor: '{who} — nicht für diese Auswahl', notForChosen: '{who} — nicht für diese Auswahl. Bitte jemand anderen oder «{any}» wählen.', took: 'Sie nehmen: {what}',
    party: 'Wie viele Personen', hours: 'Wie lange', hourShort: 'Std.', minuteShort: 'Min.', challenge: 'Bitte bestätigen Sie, dass Sie kein Roboter sind, und versuchen Sie es erneut.', tooMany: 'Sie haben bereits mehrere offene Termine. Sagen Sie einen ab oder rufen Sie uns an.',
    needContact: 'Bitte Telefon oder E-Mail angeben, damit wir Sie erreichen können.', noScript: 'Für die Online-Buchung ist JavaScript nötig — oder rufen Sie uns an.',
  },
  en: {
    service: 'Service', services: 'Services', total: 'Total', pickService: 'Pick at least one service.', resource: 'With', any: 'Anyone', day: 'Day', time: 'Time',
    name: 'Name', phone: 'Phone', email: 'Email', note: 'Note',
    book: 'Book', sending: 'Booking…', none: 'Nothing is free on that day.', noParty: 'There is no place for a party this large.',
    pick: 'Choose a day', confirmed: 'You are booked.', pending: 'Received — we will confirm shortly.',
    pay: 'Pay now', payNote: 'The time is held for 30 minutes. Complete the payment to keep it.',
    manage: 'Cancel or move the booking', telegram: 'Reminders in Telegram',
    taken: 'That time has just been taken — please choose another.', failed: 'That did not work. Please try again or ring us.',
    back: 'Until', length: 'From {min} to {max} nights.', anyOf: 'Any free — {class}', noneOf: '{class} — none available', notFor: '{who} — not for this choice', notForChosen: '{who} — not for this choice. Pick another, or «{any}».', took: 'You are taking: {what}',
    party: 'How many of you', hours: 'How long', hourShort: 'h', minuteShort: 'min', challenge: 'Please confirm you are not a robot and try again.', tooMany: 'You already have several open bookings. Cancel one, or ring us.',
    needContact: 'Leave a phone number or an email so we can reach you.', noScript: 'Booking online needs JavaScript — or ring us.',
  },
};

// A letting is had for days, not at a time: «Час», «вільного часу немає» and
// «Час зарезервовано» are a salon's words.
const DAYS = {
  uk: {
    day: 'Від', pick: 'Оберіть дати',
    time: 'Дні', none: 'Цього дня нічого вільного немає.',
    payNote: 'Ці дні тримаємо за вами 30 хвилин. Щоб закріпити їх, завершіть оплату.',
    taken: 'Ці дні щойно зайняли — оберіть інші.',
  },
  de: {
    day: 'Von', pick: 'Wählen Sie die Tage',
    time: 'Tage', none: 'Ab diesem Tag ist nichts frei.',
    payNote: 'Die Tage sind 30 Minuten für Sie reserviert. Schliessen Sie die Zahlung ab, um sie zu behalten.',
    taken: 'Diese Tage wurden gerade vergeben — bitte wählen Sie andere.',
  },
  en: {
    day: 'From', pick: 'Choose the dates',
    time: 'Days', none: 'Nothing is free from that day.',
    payNote: 'The days are held for 30 minutes. Complete the payment to keep them.',
    taken: 'Those days have just been taken — please choose others.',
  },
};

/**
 * The form's words for a language and a scale — the salon's, or a letting
 * business's by the day — as a fresh object the caller may write over.
 *
 * @param {string} locale  `uk`, `de` or `en`; anything else reads as `en`
 * @param {string} [scale] `'daily'` for a business that lets things by the day
 * @returns {Record<string, string>}
 */
export function wordsFor(locale, scale = '') {
  const lang = LOCALES.includes(locale) ? locale : 'en';
  return scale === 'daily' ? { ...BASE[lang], ...DAYS[lang] } : { ...BASE[lang] };
}
