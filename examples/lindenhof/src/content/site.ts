// Placeholder content for a FICTIONAL company. Everything in this file is a "content slot":
// the client edits it in the CMS, never the scene or layout code.
// Swap the provider in ./provider.ts for Wix Headless (@wix/data) once the collections exist.

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
  thumb: string; // rendered still in /public/thumbs
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
      id: 'baugrube',
      title: 'Kaufen. Mit Plan.',
      text: 'Eigentumswohnungen und Häuser. Sie sehen den Grundriss, bevor Sie den Schlüssel bekommen.',
      cta: 'Kaufobjekte ansehen',
      href: '#objekte',
      filter: 'kaufen',
    },
    {
      id: 'rohbau',
      title: 'Verwaltung ab dem ersten Tag.',
      text: 'Sie besitzen, wir kümmern uns. Mietverwaltung, WEG-Verwaltung, Abrechnung und Instandhaltung.',
      cta: 'Verwaltung anfragen',
      href: '#eigentuemer',
    },
    {
      id: 'ausbau',
      title: 'Mieten. Einziehen. Ankommen.',
      text: 'Wohnungen und Häuser zur Miete, mit klaren Angaben zu Größe, Lage und Kosten.',
      cta: 'Mietobjekte ansehen',
      href: '#objekte',
      filter: 'mieten',
    },
    {
      id: 'fertig',
      title: 'Und danach? Wir bleiben.',
      text: 'Schaden melden, Hausordnung nachlesen, Ansprechpartner finden. Alles an einem Ort, rund um Ihr Zuhause.',
      cta: 'Zum Mieterservice',
      href: '#mieter',
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
  { id: 'l1', mode: 'mieten', kind: 'Wohnung', street: 'Lindenallee', number: '12', city: 'Musterstadt', rooms: 2, area: 58, price: 780, available: 'ab sofort', thumb: 't0' },
  { id: 'l2', mode: 'mieten', kind: 'Wohnung', street: 'Gartenweg', number: '4a', city: 'Musterstadt', rooms: 3, area: 81, price: 1090, available: 'ab 01.01.', thumb: 't2' },
  { id: 'l3', mode: 'kaufen', kind: 'Haus', street: 'Birkenstraße', number: '7', city: 'Beispielhausen', rooms: 5, area: 142, price: 465000, available: 'nach Vereinbarung', thumb: 't1' },
  { id: 'l4', mode: 'mieten', kind: 'Wohnung', street: 'Am Park', number: '21', city: 'Beispielhausen', rooms: 1, area: 34, price: 520, available: 'ab 01.12.', thumb: 't3' },
  { id: 'l5', mode: 'kaufen', kind: 'Wohnung', street: 'Siedlerweg', number: '3', city: 'Musterstadt', rooms: 4, area: 96, price: 318000, available: 'ab sofort', thumb: 't4' },
  { id: 'l6', mode: 'mieten', kind: 'Haus', street: 'Eichenring', number: '15', city: 'Musterstadt', rooms: 4, area: 118, price: 1650, available: 'ab 01.02.', thumb: 't5' },
  { id: 'l7', mode: 'kaufen', kind: 'Wohnung', street: 'Lindenallee', number: '30', city: 'Musterstadt', rooms: 3, area: 74, price: 259000, available: 'nach Vereinbarung', thumb: 't6' },
  { id: 'l8', mode: 'mieten', kind: 'Wohnung', street: 'Bahnhofsplatz', number: '2', city: 'Beispielhausen', rooms: 2, area: 49, price: 690, available: 'ab sofort', thumb: 't7' },
];
