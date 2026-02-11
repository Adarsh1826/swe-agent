import { execSync } from 'child_process';

export function runPrettierOnFiles(files: string[]) {
  if (!files.length) return;

  const cmd = `npx prettier --write ${files.join(' ')}`;
  execSync(cmd, { stdio: 'inherit' });
}
