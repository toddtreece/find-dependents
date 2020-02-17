import { RipGrep } from 'ripgrep-node';
import { getFileName } from './path';
import { sep } from 'path';

export interface Match {
  search: string;
  file: string;
  imported: string;
}

export const parseResult = (search: string) => (json: string): Match => {
  const { path, lines } = JSON.parse(json.trim()).data;
  return {
    search,
    file: path.text,
    imported: lines.text.match(/['"](.*)['"]/)[1]
  };
};

const findIndexFolder = (searchDirectory: string, filePath: string): Match[] => {
  const folderPath = filePath
    .split(sep)
    .slice(0, -1)
    .join(sep);

  if (!folderPath) {
    return [];
  }

  return findDependents(searchDirectory, folderPath);
};

export const findDependents = (searchDirectory: string, filePath: string): Match[] => {
  const name = getFileName(filePath);

  const pattern = `^[import|export].*from\\s['\\"](\\..*/${name})['\\"]`;
  const rg = new RipGrep(pattern, searchDirectory);

  let results: Match[] = [];

  try {
    results = rg
      .json()
      .run()
      .asJson()
      .map(parseResult(filePath));
  } catch (err) {
    results = [];
  }

  if (name === 'index') {
    const folderResults = findIndexFolder(searchDirectory, filePath);
    return [...results, ...folderResults];
  }

  return results;
};
