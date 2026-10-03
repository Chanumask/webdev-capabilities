// Content slots. Everything an editor may change lives here (or in the CMS), never in layout/scene code.
export interface SiteContent {
  name: string;
  tagline: string;
}

export const site: SiteContent = {
  name: '__NAME__',
  tagline: 'Platzhalter, wird im Build-Schritt aus dem Briefing befüllt.',
};
