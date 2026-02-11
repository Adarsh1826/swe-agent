import { detectPrettierIssues } from './prettier-detector.js';
import { aiSelectPrettierFiles } from './prettier-ai-plan.js';
import { runPrettierOnFiles } from '../../scripts/run-prettier.js';
import { createPRWithAppAuth } from '../../utils/pullrequest/pr.js';

export async function runPrettierSWEAgent({
  owner,
  repo,
  branchName,
  installationId,
  mode = 'ci', // 'ci' | 'pr'
}: {
  owner: string;
  repo: string;
  branchName: string;
  installationId: number;
  mode?: 'ci' | 'pr';
}) {
  console.log('Running Prettier SWE Agent...');
  console.log('Mode:', mode);

  /* ---------------- Detect Prettier Issues ---------------- */
  const failedFiles = detectPrettierIssues();

  if (!failedFiles.length) {
    console.log('Repository already Prettier clean');
    return;
  }

  console.log(`Detected ${failedFiles.length} Prettier issue(s)`);

  /* ---------------- AI File Selection ---------------- */
  const safeFiles = await aiSelectPrettierFiles(failedFiles);

  if (!safeFiles.length) {
    console.log('AI skipped formatting (no safe files)');
    return;
  }

  console.log(`Formatting ${safeFiles.length} file(s)`);

  /* ---------------- Run Prettier ---------------- */
  runPrettierOnFiles(safeFiles);

  /* ---------------- CI Mode → Stop Here ---------------- */
  if (mode === 'ci') {
    console.log('CI mode: formatting complete (no PR)');
    return;
  }

  /* ---------------- PR Mode → Create Pull Request ---------------- */
  console.log('Creating Prettier Pull Request...');

  await createPRWithAppAuth({
    owner,
    repo,
    branchName,
    baseBranch: 'main',
    title: 'chore(prettier): automated formatting',
    body: `
This pull request applies automated Prettier fixes.

• AI-selected safe files
• Formatting only
• No logic changes
    `,
    installationId,
  });

  console.log('Prettier PR created successfully');
}
