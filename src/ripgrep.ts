import { spawn } from 'child_process';

export async function* rg(pattern: string, directory: string) {
  const results = spawn('rg', ['--json', pattern, directory]);

  let err = '';
  for await (const chunk of results.stderr) {
    err += chunk.toString().trim();
  }

  if (err) {
    throw new Error(err);
  }

  yield* results.stdout;
}
