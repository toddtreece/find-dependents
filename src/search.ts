import { getFileName, pathSeparator } from './path';
import { rg } from './ripgrep';

export interface Match {
  search: string;
  file: string;
  imported: string;
}

export const buildParser = (search: string) => {
  return function* parser(chunk: Buffer): Generator<Match> {
    const chunks = chunk.toString().split('\n');
    for (const json of chunks) {
      if (!json.trim()) {
        break;
      }

      const parsed = JSON.parse(json.trim());

      if (parsed.type === 'match') {
        const { path, lines } = parsed.data;
        yield {
          search,
          file: path.text,
          imported: lines.text.match(/['"](.*)['"]/)[1]
        };
      }
    }
  };
};

async function* findIndexFolder(searchDirectory: string, filePath: string): AsyncGenerator<Match> {
  const folderPath = filePath
    .split(pathSeparator)
    .slice(0, -1)
    .join(pathSeparator);

  if (folderPath) {
    yield* findDependents(searchDirectory, folderPath);
  }
}

export async function* findDependents(searchDirectory: string, filePath: string): AsyncGenerator<Match> {
  const parse = buildParser(filePath);
  const name = getFileName(filePath);

  const pattern = `^[import|export].*from\\s['"]\\..*/${name}['"]`;
  const results = rg(pattern, searchDirectory);

  for await (const chunk of results) {
    yield* parse(chunk);
  }

  if (name === 'index') {
    yield* findIndexFolder(searchDirectory, filePath);
  }
}
