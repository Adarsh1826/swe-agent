import { execSync } from 'child_process';

export function detectPrettierIssues(): string[] {
  try {
    execSync('npx prettier --check .', { stdio: 'pipe' });
    return [];
  } catch (err: any) {
    const output = err.stdout?.toString() || '';

    return output
      .split('\n')
      .filter((line: string) => line.includes('[warn]'))
      .map((line: string) =>
        line.replace('[warn]', '').trim(),
      );
  }
}
