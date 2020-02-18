import { getFileName, pathSeparator } from './path';
import { rg } from './ripgrep';

export interface Match {
  search: string;
  file: string;
  imported: string;
}

export const buildParser = (search: string) => {
  return function* parser(json: string): Generator<Match> {
    const parsed = JSON.parse(json);

    if (parsed.type === 'match') {
      const { path, lines } = parsed.data;
      yield {
        search,
        file: path.text,
        imported: lines.text.match(/['"](.*)['"]/)[1]
      };
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

  // TODO switch back to streaming parsing
  let buffer = '';
  for await (const chunk of results) {
    buffer += chunk.toString();
  }

  for (const line of buffer.split('\n')) {
    const json = line.trim();
    if (json) {
      yield* parse(json);
    }
  }

  if (name === 'index') {
    yield* findIndexFolder(searchDirectory, filePath);
  }
}
