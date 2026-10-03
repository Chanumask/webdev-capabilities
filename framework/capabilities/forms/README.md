# Capability: forms

Contact, enquiry and damage-report forms with clear validation. Reference: forms in `framework/examples/lindenhof` (`src/pages/index.astro`, `src/scripts/ui.ts`, field styles in `src/styles/global.css`).

## Needs
Decision from the brief: demo only, email through a form service (Formspree, Web3Forms, Resend), or CMS-native. Recipient address, consent text, spam protection.

## Behaviour
- Native `required` and `type` attributes with `novalidate` on the form; custom messages that **name the field**: "Bitte füllen Sie das Feld „Ihr Name“ aus."
- Errors appear after a field was left (`blur` adds a `touched` class) or after a submit attempt, never on load. Style with `.input.touched:invalid`.
- Required fields are marked in text ("Pflichtfeld"), not only by colour.
- Success state in a `role="status"` region; focus moves to the first invalid field on error.
- Spam protection: hidden honeypot field by default.
- Privacy: consent checkbox text when personal data is collected; no third-party scripts.
- Demo mode shows an honest message ("Demo: nicht gesendet") until a backend is connected.

## Sending (when decided)
Post `FormData` with `fetch` to the service endpoint; handle network errors with a message that says what to do ("Bitte erneut versuchen oder anrufen"); keep the endpoint id in `.env`/config.

## Verification
Empty submit, partial fill, success, offline error; keyboard-only use; screen-reader announcement; mobile keyboard types (`type="email"`, `autocomplete`).
