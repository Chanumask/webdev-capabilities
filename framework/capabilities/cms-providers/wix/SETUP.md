# Set up Wix as the CMS (step by step, German dashboard)

For the person who owns the content (the client, or you while testing). Takes about 20 minutes the first time. You never design anything in Wix: our site is the frontend, Wix is only the place where texts, prices and photos are edited. Used by the `connect-cms` skill; technical details in the [Wix provider README](README.md).

How it fits together: the website reads the content from Wix **when it is built** with a read-only key. Editing in Wix changes nothing on the live site until the site is rebuilt (see "Making edits go live" in the README). Hosting and domain are independent of this; Wix is only the content.

Tested on 2026-10-03 with a free Wix site on the Harmony editor. Menu names change; where a label below is marked _(not confirmed)_ it was not seen on screen.

## Never in the chat
The API key and the site ID go **only** into the file `sites/<slug>/.env`. Do not paste them into the chat with the agent, an email or any other file. The agent will not open `.env`; it only runs `npm run cms:check` and tells you whether it works.

## 1. Wix account and site
1. Log in at wix.com (or create a free account).
2. You need **one Wix site** in the account. A free plan is enough, any template, never published. (The API key in step 5 can only be limited to a site that already exists, so do this first.)

## 2. Install the CMS app
A new site has **no CMS in the left sidebar**. Check "Website & App" and "Apps" first; if it is not there:
1. Left sidebar → **Apps** → **App Market** (search field).
2. Search `cms`. For sites on the Harmony editor choose **"CMS for Harmony"** (free plan available). Ignore Contentful Integration, CMS Reports and CMS-Karte & Filialfinder.
3. Click **Hinzufügen** (add). Afterwards **CMS** appears in the sidebar (possibly under Apps).

(For sites on the older Wix Editor, the CMS is switched on with **Dev Mode / Entwicklermodus** in the editor instead. _Not confirmed._)

## 3. Create a collection with content
In **CMS** create one collection per kind of content (for a property website: `Listings`).
- Use short field names without spaces: `title`, `price`, `city`, `description`, `image`. Field names are what the website reads; ask the agent which fields the site needs (it comes from the brief).
- Add a few items (3 to 5 are enough to test).
- Note the **collection ID**. It is shown in the collection settings and is usually the lower case name (`listings`). Use the ID, not the display name.

## 4. Find the site ID
Open the dashboard of the site and look at the browser address:
`https://manage.wix.com/dashboard/`**`229cf489-43ea-…`**`/setup?...`
The long UUID right after `/dashboard/` is the **site ID**. It identifies the site and does not grant access on its own.

## 5. Create the API key
Open https://manage.wix.com/account/api-keys → **API-Schlüssel generieren**.
1. **Name**: any, for example `website-lesen` (reading the website's content).
2. **Sites**: choose **Specific sites** and select only this site. The default "All sites" lets the key reach every site in the account.
3. **Berechtigungen** (permissions): leave all four big checkboxes empty: _Alle Berechtigungen_, _Alle Konto-Berechtigungen_, _All organization permissions_, _Alle Website-Berechtigungen_. "Websites-Listen erhalten" is ticked and greyed out by default; that is not the data permission.
4. Click **Alle ansehen** next to _Alle Website-Berechtigungen_ (do not tick the box), find the CMS / Wix Data section and tick **only the read permission for data items**: **Read Data Items** (German label _not confirmed_). Nothing that writes, changes, deletes or manages. If the section is missing, the CMS app is not installed yet (step 2); reload the form.
5. Click **Schlüssel generieren**. The key is shown **once**: copy it directly into `.env` (next step). If you lose it, delete the key and create a new one.

## 6. Fill in `.env`
In `sites/<slug>/` copy `.env.example` to `.env` (the disclaimer at the top explains the rules) and fill in:
```
CMS_PROVIDER=wix
WIX_API_KEY=<the key from step 5>
WIX_SITE_ID=<the UUID from step 4>
WIX_COLLECTIONS=listings
```
`WIX_COLLECTIONS` takes the collection IDs from step 3, separated by commas.

## 7. Check the connection
`npm run cms:check -- <slug>` (the agent runs it for you). Success looks like `OK listings - reachable, 3 item(s)`.

| Message | Meaning and fix |
|---|---|
| key not accepted (401) | `WIX_API_KEY` is incomplete, revoked or has a stray space. Create a new key. |
| may not read this data (403) | The key lacks "Read Data Items" or does not include this site (step 5). |
| collection not found (404) | Wrong collection ID, or the CMS app is not installed. Use the ID, not the display name (step 3). |
| No `.env` | Step 6: copy `.env.example` to `.env`. |

## 8. Done when
`cms:check` shows OK for every collection, the items you created are counted, and the client knows where to edit (Wix dashboard → CMS) and that changes appear after the site is rebuilt. Note the Wix account owner, plan and renewal in the handover accounts list ([ACCOUNTS](../../../templates/launch/ACCOUNTS.md)).

## Still untested
Photos from Wix (`wix:image://` references) and a complete site build from live Wix content. If something in this guide differs from what you see on screen, say so in the session wrap-up so the guide gets corrected.
