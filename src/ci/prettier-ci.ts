import { detectPrettierIssues } from '../agent/prettier/prettier-detector.js';
import { runPrettierOnFiles } from '../scripts/run-prettier.js';
import { execSync } from 'child_process';

async function run() {
  const failed = detectPrettierIssues();
  if (!failed.length) return;

  runPrettierOnFiles(failed);

  const diff = execSync('git status --porcelain').toString();
  if (!diff.trim()) return;

  execSync('git config user.name "prettier-bot"');
  execSync('git config user.email "bot@prettier.ai"');
  execSync('git add .');
  execSync('git commit -m "chore(prettier): auto-fix"');
  execSync('git push');
}

run();
