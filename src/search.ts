import { resolveFromDirectory, resolveFromFile, pathSeparator, getFileName } from './path';
import { rg } from './ripgrep';

export const PATH = Symbol('PATH');

export interface Match {
  path: string;
  isFolder: boolean;
  import: string;
}

export interface File {
  kind: 'file';
  [PATH]: string;
  imports: Set<string>;
}

export interface Folder {
  kind: 'folder';
  [PATH]: string;
  imports: Set<string>;
}

export function buildMatch(searchDirectory: string, parsed: any): Match {
  const { path, lines } = parsed.data;
  const file = resolveFromDirectory(searchDirectory, path.text);
  const [imprt] = resolveFromFile(file, lines.text.match(/['"](.*)['"]/)[1]).split('.');
  return {
    path: file,
    isFolder: false,
    import: imprt
  };
}

export function indexFolder(match: Match): Match {
  // get the path to the parent folder
  const folder = match.path
    .split(pathSeparator)
    .slice(0, -1)
    .join(pathSeparator);

  return {
    path: folder,
    isFolder: true,
    import: match.import
  };
}

export async function* findImports(searchDirectory: string): AsyncGenerator<Match> {
  const pattern = `^[import|export].*from\\s['"]\\..*['"]`;
  const results = rg(pattern, searchDirectory);

  // TODO switch back to streaming parsing
  let buffer = '';
  for await (const chunk of results) {
    buffer += chunk.toString();
  }

  for (const line of buffer.split('\n')) {
    const json = line.trim();
    if (!json) {
      continue;
    }

    const parsed = JSON.parse(json);
    if (parsed.type !== 'match') {
      continue;
    }

    const match = buildMatch(searchDirectory, parsed);
    yield match;

    if (getFileName(match.path) === 'index') {
      yield indexFolder(match);
    }
  }
}

export async function getDependencyMap(searchDirectory: string) {
  const imports = findImports(searchDirectory);
  const map: Map<string, File | Folder> = new Map();

  for await (const match of imports) {
    const [fileName] = match.path.split('.');
    const existing = map.get(fileName);

    if (existing) {
      existing.imports.add(match.import);
      continue;
    }

    if (match.isFolder) {
      const folder: Folder = {
        kind: 'folder',
        [PATH]: match.path,
        imports: new Set([match.import])
      };
      map.set(fileName, folder);
    } else {
      const file: File = {
        kind: 'file',
        [PATH]: match.path,
        imports: new Set([match.import])
      };
      map.set(fileName, file);
    }
  }

  return map;
}
