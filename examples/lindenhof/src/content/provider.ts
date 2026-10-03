// Content access layer. Pages only call these functions, never import site.ts directly.
// To move to Wix Headless: replace the bodies with @wix/data queries
// (items.query('Listings').find()) using a Wix API key in .env, and map items to the types in ./site.ts.
// Because Astro builds statically, a Wix "content published" webhook should trigger a rebuild on the host.
import { site, listings, type Listing, type SiteContent } from './site';

export async function getSite(): Promise<SiteContent> {
  return site;
}

export async function getListings(): Promise<Listing[]> {
  return listings;
}
