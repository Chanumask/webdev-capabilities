#!/usr/bin/env node
/**
 *   node tools/status.mjs <site> [--json]
 * Reads the site's brief and artifacts, works out which stage it is in, and proposes the next steps.
 * Website-mode agents run this at the start of a session and after each stage, then ask the user
 * what to do next with those options (framework/NEXT-STEPS.md). The agent leads the conversation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { root, findSite, die } from './lib.mjs';
import { parseFrontMatter } from './brief.mjs';

const ROUND_TITLES = [
  'Basics and intent',
  'Audience and content',
  'Style and design',
  'Architecture and technology',
  'Deep dive',
  'Review and lock',
];

/** Number of intake rounds that have content in INTAKE.md. */
export function roundsDone(intakeText) {
  let done = 0;
  for (let n = 1; n <= 6; n++) {
    const m = new RegExp(`## Round ${n}:[^\\n]*\\n([\\s\\S]*?)(?=\\n## Round |$)`).exec(intakeText);
    const body = (m?.[1] ?? '').trim();
    if (body && !/^_not started_$/i.test(body)) done = n;
    else break;
  }
  return done;
}

export function acceptanceProgress(text) {
  const boxes = text.match(/- \[[ xX]\]/g) ?? [];
  return { done: boxes.filter((b) => /x/i.test(b)).length, total: boxes.length };
}

const step = (id, label, skill, why, recommended = false) => ({ id, label, skill, why, recommended });

/** Pure: facts in, stage and proposals out. */
export function analyse(f) {
  const fm = f.fm;
  const status = fm.status || 'draft';
  const launch = fm.launch || 'none';
  const handover = fm.handover || 'none';
  const base = { facts: f };

  if (status === 'draft') {
    if (f.rounds < 6) {
      const n = f.rounds + 1;
      return {
        ...base,
        stage: 'intake',
        label: `Design intake, ${f.rounds} of 6 rounds done`,
        question: `Continue with round ${n} (${ROUND_TITLES[n - 1]})?`,
        nextSteps: [
          step(
            'continue-intake',
            `Continue with round ${n}: ${ROUND_TITLES[n - 1]}`,
            'new-site',
            'Each round makes the first build closer to what you want.',
            true,
          ),
          step(
            'express',
            'Let the agent propose sensible defaults for the remaining rounds',
            'new-site',
            'Faster; you can still correct afterwards.',
          ),
          step(
            'pause',
            'Pause here (everything is saved and can be resumed)',
            'new-site',
            'The answers are in brief/INTAKE.md.',
          ),
        ],
      };
    }
    return {
      ...base,
      stage: 'lock',
      label: 'All rounds answered, brief waits for approval',
      question: 'Is this the website you want built?',
      nextSteps: [
        step(
          'approve',
          'Show the summary and ask for approval (round 6)',
          'new-site',
          'Nothing is built before an explicit yes.',
          true,
        ),
        step('change', 'Change something in the brief first', 'new-site', 'Loops back to the relevant round.'),
      ],
    };
  }
  if (status === 'approved') {
    return {
      ...base,
      stage: 'build',
      label: 'Brief approved, site not built yet',
      question: 'Shall I build the site now?',
      nextSteps: [
        step(
          'build',
          'Build the site in one pass and show it on localhost',
          'build-site',
          'The brief is approved.',
          true,
        ),
      ],
    };
  }

  // built or delivered
  const checks = f.acceptance.total
    ? `${f.acceptance.done}/${f.acceptance.total} acceptance items checked`
    : 'no acceptance list';
  if (launch === 'none') {
    return {
      ...base,
      stage: 'review',
      label: `Site built, in review (${checks})`,
      question: 'What would you like to do next?',
      nextSteps: [
        step(
          'feedback',
          'Walk through the site and tell me what to change',
          'change-site',
          'Collect all feedback in one batch, then I change it together.',
          true,
        ),
        step(
          'export',
          'Export one file to send to someone for a first opinion',
          'export-site',
          f.hasExport ? 'An export exists; make a fresh one after changes.' : 'No export yet.',
        ),
        step(
          'launch',
          'I am happy with it: prepare the launch (domain and hosting)',
          'launch-site',
          'Starts the guided launch: decisions, preparation, deployment, domain, verification.',
        ),
      ],
    };
  }
  if (launch === 'decided') {
    return {
      ...base,
      stage: 'launch-prepare',
      label: 'Launch decisions made, files not prepared',
      question: 'Shall I prepare the launch files and checklist?',
      nextSteps: [
        step(
          'prepare',
          'Prepare deploy files, run the pre-launch check, write the step-by-step launch guide',
          'launch-site',
          'Everything you need to click through, in order.',
          true,
        ),
      ],
    };
  }
  if (launch === 'prepared') {
    return {
      ...base,
      stage: 'deploy',
      label: 'Launch prepared, not deployed',
      question: 'Ready to put the site online?',
      nextSteps: [
        step(
          'deploy',
          'Walk through hosting and domain step by step (you click, I guide and verify)',
          'launch-site',
          'Accounts and payments are always done by you.',
          true,
        ),
        step(
          'recheck',
          'Run the pre-launch check again after changes',
          'launch-site',
          'Catches leftover placeholders and missing basics.',
        ),
        step('feedback', 'Change something first', 'change-site', 'Then re-run the check.'),
      ],
    };
  }
  if (launch === 'deployed') {
    return {
      ...base,
      stage: 'verify',
      label: 'Deployed, domain and live site not verified',
      question: 'Shall I check that the domain and the live site work?',
      nextSteps: [
        step(
          'verify',
          'Check DNS, HTTPS, redirects and the live pages',
          'launch-site',
          'Tells you what is still pending (DNS can take up to a day).',
          true,
        ),
      ],
    };
  }
  if (handover !== 'done') {
    return {
      ...base,
      stage: 'handover',
      label: 'Site is live, handover not done',
      question: 'Shall I prepare the handover package?',
      nextSteps: [
        step(
          'handover',
          'Create the handover package (guide, accounts checklist, source, costs)',
          'handover-site',
          'So the owner can run the site without us.',
          true,
        ),
        step('feedback', 'Change something first', 'change-site', 'Then hand over.'),
      ],
    };
  }
  return {
    ...base,
    stage: f.hasReport ? 'maintain' : 'wrap-up',
    label: f.hasReport ? 'Live and handed over' : 'Live and handed over, session not wrapped up',
    question: f.hasReport
      ? 'Anything to change or add?'
      : 'Shall I wrap up the session and note what to improve in the framework?',
    nextSteps: [
      ...(f.hasReport
        ? []
        : [
            step(
              'wrap-up',
              'Wrap up: session report and framework feedback',
              'wrap-up',
              'Helps improve the question catalog and guidance.',
              true,
            ),
          ]),
      step(
        'feedback',
        'Change or extend the site',
        'change-site',
        'New wishes start as a change request.',
        f.hasReport,
      ),
    ],
  };
}

export function collectFacts(siteDir, slug) {
  const read = (rel) => {
    const p = path.join(siteDir, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  };
  let hasRemote = false;
  try {
    hasRemote =
      execSync('git remote', { cwd: siteDir, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim().length > 0;
  } catch {
    /* not a git repo */
  }
  const briefDir = path.join(siteDir, 'brief');
  return {
    slug,
    fm: parseFrontMatter(read('brief/BRIEF.md')),
    rounds: roundsDone(read('brief/INTAKE.md')),
    acceptance: acceptanceProgress(read('brief/ACCEPTANCE.md')),
    hasExport: fs.existsSync(path.join(root, 'exports', slug, 'index.html')),
    hasLaunchDir: fs.existsSync(path.join(siteDir, 'launch')),
    hasReport: fs.existsSync(briefDir) && fs.readdirSync(briefDir).some((n) => n.startsWith('SESSION-REPORT')),
    hasRemote,
  };
}

export function format(result) {
  const lines = [
    `Site: ${result.facts.slug}`,
    `Stage: ${result.stage} - ${result.label}`,
    '',
    `Ask the user: ${result.question}`,
    '',
  ];
  for (const s of result.nextSteps)
    lines.push(`${s.recommended ? '*' : '-'} ${s.label}  [${s.skill}]${s.why ? `  ${s.why}` : ''}`);
  lines.push('', '(* = recommended; offer these with AskUserQuestion, recommended option first)');
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  if (!slug) die('Usage: node tools/status.mjs <site> [--json]');
  const site = findSite(slug);
  if (!site) die(`Site "${slug}" not found. Run: npm run list`);
  const result = analyse(collectFacts(site.dir, slug));
  console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : format(result));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
