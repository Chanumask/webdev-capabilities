// Placeholder content for a FICTIONAL company. Everything in this file is a "content slot":
// the client edits it in the CMS, never the scene or layout code.
// Swap the provider in ./provider.ts for Wix Headless (@wix/data) once the collections exist.

export type Accent = 'red' | 'yellow' | 'green' | 'blue';

export interface Listing {
  id: string;
  mode: 'mieten' | 'kaufen';
  kind: 'Wohnung' | 'Haus';
  street: string;
  number: string;
  city: string;
  rooms: number;
  area: number; // m²
  price: number; // EUR; rent = Kaltmiete / Monat, buy = Kaufpreis
  available: string;
  floors: number; // for the illustration only
  accent: Accent;
}

export interface Service {
  title: string;
  text: string;
}

export interface SiteContent {
  name: string;
  tagline: string;
  intro: string;
  address: string[];
  phone: string;
  email: string;
  emergencyPhone: string;
  chapters: { id: string; title: string; text: string; cta: string; href: string; filter?: 'mieten' | 'kaufen' }[];
  services: Service[];
  tenantLinks: { label: string; href: string }[];
}

export const site: SiteContent = {
  name: 'Lindenhof',
  tagline: 'Hausverwaltung · Vermietung · Verkauf',
  intro:
    'Lindenhof vermietet, verkauft und verwaltet Wohnungen und Häuser – für alle, die darin wohnen, und alle, denen sie gehören.',
  address: ['Musterstraße 1', '00000 Musterstadt'],
  phone: '+49 000 0000000',
  email: 'kontakt@lindenhof.example',
  emergencyPhone: '+49 000 0000001',
  chapters: [
    {
      id: 'mieterservice',
      title: 'Erdgeschoss: Wer hier wohnt, hat es einfach.',
      text: 'Schaden melden, Hausordnung nachlesen, Ansprechpartner finden. Alles an einem Ort, rund um Ihr Zuhause.',
      cta: 'Zum Mieterservice',
      href: '#mieter',
    },
    {
      id: 'mieten',
      title: 'Mieten. Einziehen. Ankommen.',
      text: 'Wohnungen und Häuser zur Miete, mit klaren Angaben zu Größe, Lage und Kosten.',
      cta: 'Mietobjekte ansehen',
      href: '#objekte', filter: 'mieten',
    },
    {
      id: 'kaufen',
      title: 'Kaufen. Mit Plan.',
      text: 'Eigentumswohnungen und Häuser. Sie sehen den Grundriss, bevor Sie den Schlüssel bekommen.',
      cta: 'Kaufobjekte ansehen',
      href: '#objekte', filter: 'kaufen',
    },
    {
      id: 'eigentuemer',
      title: 'Ganz oben: die Eigentümer.',
      text: 'Sie besitzen, wir kümmern uns. Mietverwaltung, WEG-Verwaltung, Abrechnung und Instandhaltung.',
      cta: 'Verwaltung anfragen',
      href: '#eigentuemer',
    },
    {
      id: 'viertel',
      title: 'Aus einem Haus wird ein Viertel.',
      text: 'Alle Objekte auf einen Blick. Unten geht es weiter mit dem, was gerade frei ist.',
      cta: 'Zu den Objekten',
      href: '#objekte',
    },
  ],
  services: [
    { title: 'Mietverwaltung', text: 'Mieter finden, Verträge führen, Mieten einziehen, Ansprechpartner sein.' },
    { title: 'WEG-Verwaltung', text: 'Eigentümerversammlungen, Beschlüsse, Wirtschaftsplan, Hausgeldabrechnung.' },
    { title: 'Nebenkostenabrechnung', text: 'Eine Abrechnung, die man ohne Anleitung versteht.' },
    { title: 'Instandhaltung', text: 'Handwerker koordinieren, Schäden dokumentieren, Termine im Blick behalten.' },
    { title: 'Vermietung und Verkauf', text: 'Von der Besichtigung bis zur Schlüsselübergabe, für Ihr Objekt oder Ihr Haus.' },
  ],
  tenantLinks: [
    { label: 'Hausordnung (PDF, Platzhalter)', href: '#mieter' },
    { label: 'Formulare und Dokumente (Platzhalter)', href: '#mieter' },
  ],
};

// Sample objects. Prices are demo values, NOT real offers.
export const listings: Listing[] = [
  { id: 'l1', mode: 'mieten', kind: 'Wohnung', street: 'Lindenallee', number: '12', city: 'Musterstadt', rooms: 2, area: 58, price: 780, available: 'ab sofort', floors: 4, accent: 'red' },
  { id: 'l2', mode: 'mieten', kind: 'Wohnung', street: 'Gartenweg', number: '4a', city: 'Musterstadt', rooms: 3, area: 81, price: 1090, available: 'ab 01.01.', floors: 3, accent: 'yellow' },
  { id: 'l3', mode: 'kaufen', kind: 'Haus', street: 'Birkenstraße', number: '7', city: 'Beispielhausen', rooms: 5, area: 142, price: 465000, available: 'nach Vereinbarung', floors: 2, accent: 'green' },
  { id: 'l4', mode: 'mieten', kind: 'Wohnung', street: 'Am Park', number: '21', city: 'Beispielhausen', rooms: 1, area: 34, price: 520, available: 'ab 01.12.', floors: 5, accent: 'blue' },
  { id: 'l5', mode: 'kaufen', kind: 'Wohnung', street: 'Siedlerweg', number: '3', city: 'Musterstadt', rooms: 4, area: 96, price: 318000, available: 'ab sofort', floors: 4, accent: 'red' },
  { id: 'l6', mode: 'mieten', kind: 'Haus', street: 'Eichenring', number: '15', city: 'Musterstadt', rooms: 4, area: 118, price: 1650, available: 'ab 01.02.', floors: 2, accent: 'green' },
  { id: 'l7', mode: 'kaufen', kind: 'Wohnung', street: 'Lindenallee', number: '30', city: 'Musterstadt', rooms: 3, area: 74, price: 259000, available: 'nach Vereinbarung', floors: 5, accent: 'yellow' },
  { id: 'l8', mode: 'mieten', kind: 'Wohnung', street: 'Bahnhofsplatz', number: '2', city: 'Beispielhausen', rooms: 2, area: 49, price: 690, available: 'ab sofort', floors: 4, accent: 'blue' },
];
