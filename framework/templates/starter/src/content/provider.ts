// Pages only call these functions. To connect a CMS (Wix Headless, Sanity, ...), change the bodies here.
import { site, type SiteContent } from './site';

export async function getSite(): Promise<SiteContent> {
  return site;
}
