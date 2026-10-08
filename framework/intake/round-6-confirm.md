# Round 6: Review and lock

Goal: let the user see the whole plan in one place, correct it once, and approve. After this round the build runs without further questions.

## Step 1: Present the brief
Write the final `brief/BRIEF.md` and show a **short summary in the chat** (not the whole file): what, for whom, goal and main action, structure, look and feel (direction name plus three adjectives), the signature animation in one sentence, technology and CMS, what is placeholder, what is delegated.

## Step 2: Make assumptions visible
List separately, in plain words:
- **Decisions I made for you** (delegated) with a one-line reason each.
- **Placeholders** that will be clearly marked (texts, images, data, legal data, phone numbers).
- **Not included** in this build (for example checkout, bookings, logins, real deployment, domain setup, final legal texts).
- **Risks** worth knowing (for example "stylised 3D is built in code, so realism has a ceiling"; "photographic frames cannot be rotated and buildings need good models to look like photos").

## Step 3: Acceptance checklist
Generate `brief/ACCEPTANCE.md` from the brief: a checklist the finished site must satisfy (primary action reachable in the first screen, every section present, copy in the right language and tone, contrast and keyboard checks, reduced-motion fallback, phone/tablet/desktop screenshots reviewed, forms behave, export file opens offline, no invented facts). The build ends only when it is checked off.

## Step 4: Ask for approval
Use `AskUserQuestion`:
Ask: Is this the website you want built?
Options:
- Yes, build it (Recommended): build once, show it on localhost, one review round included
- I want to change something: say what (loop back to the relevant round, then return here)
- Not yet: save everything and stop here (the chat can be resumed)
Never start the build without an explicit yes.

## Step 5: After approval
1. Mark the brief `status: approved` with the date.
2. Commit the brief (`brief: approved <slug>`).
3. Continue with the build workflow in `framework/WORKFLOW.md` (stage "Build").
4. Mention the road ahead: after build and review comes the guided launch (domain, hosting, handover); the agent will lead each step.
5. Tell the user how to look at the result: run `npm run dev -- <slug>`, open the printed localhost address, and where the export file will appear.
