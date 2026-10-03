# Intake: how the agent asks

The goal of the intake is to capture the **full context** of a website so the build succeeds in one pass with little tuning afterwards. The user is usually **not technical**. They know their business, their customers and what they like, but not what a "headless CMS" is.

## Rules

1. **Use the `AskUserQuestion` tool for every round.** At most 4 questions per call, 2 to 4 options each. The tool adds an "Other" field automatically, so never add "Other" yourself. Users can always write something different.
2. **Rounds get more detailed.** Round N+1 is written from the answers of round N. Skip questions that are already answered. Drop modules that do not apply. Add follow-ups when an answer opens a new dimension (for example "listings" opens the data model).
3. **Plain language.** Ask in the user's language (match their last message; German if they write German). No jargon. When a technical term is unavoidable, explain it in the option description in one short sentence.
4. **Every technical question has a recommended option.** Put it first and append "(Recommended)" to its label. In the description say why it is recommended *for this project*, using what you already know. If the user answers "you decide", record it as `delegated` and write the default plus the reason in the brief.
5. **Options show consequences, not just names.** "Sanity: editors get a clean form-style editor, free for small sites, needs an account" beats "Sanity".
6. **Use previews** (the `preview` field of an option) when comparing visual or structural options: page structures, scroll stories, layout sketches as ASCII.
7. **Recap before each round** in 2 to 4 lines: "So far: a property-management company, German, goal = enquiries, audience = owners and tenants." This lets the user correct early.
8. **Never invent facts.** Prices, testimonials, statistics, awards, team members, legal data: if the user has none, record "placeholder, clearly marked" and keep it marked in the build.
9. **Save progress after every round** to `sites/<slug>/brief/INTAKE.md` (raw answers with question ids) so a chat can be resumed. Update `brief/BRIEF.md` at the end of each round.
10. **Do not ask what you can decide as a professional**, unless it changes the result visibly. You decide: spacing scale, breakpoints, file names, build tooling. You ask: mood, colours, who the visitors are, what a visitor should do, which pages exist.
11. **Offer the express path.** At the start say that quick answers ("you decide") are fine and that more answers means fewer corrections later. Respect it: record delegated decisions.
12. **Keep each call short.** After round 3 ask whether to continue to architecture and detail or to let the agent propose defaults.

## Question format used in this folder

```
### Q<round>.<n> <title>
Ask:       the wording to show (translate to the user's language)
Why:       what this decides (for you, not shown to the user)
Type:      single | multi | free text (use "Other")
Options:   label: description   ("(Recommended)" marks the default)
Follow-up: conditions that add questions
Writes:    BRIEF.md section or field
```

## Adapting the order

The rounds are a default order, not a script. If the user opens with a rich description, extract everything you can, confirm it in a recap, and only ask the gaps. If the user says "like this site (URL)", fetch it, summarise what you saw, and ask what to keep and what to change.

## Rounds

| Round | File | Purpose |
|---|---|---|
| 1 | [round-1-basics-intent.md](round-1-basics-intent.md) | What is it, for whom is it made, what must happen |
| 2 | [round-2-audience-content.md](round-2-audience-content.md) | Visitors, pages, content, images, what changes over time |
| 3 | [round-3-style-design.md](round-3-style-design.md) | Mood, colour, type, motion, 3D, references, things to avoid |
| 4 | [round-4-architecture.md](round-4-architecture.md) | Tech stack, CMS, hosting, forms, tools (with recommendations) |
| 5 | [round-5-deep-dive.md](round-5-deep-dive.md) | Adaptive modules: data model, scroll story, CMS model, SEO, legal |
| 6 | [round-6-confirm.md](round-6-confirm.md) | Review the brief, lock assumptions, acceptance checklist, go |
