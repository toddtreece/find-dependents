#!/usr/bin/env node

import { CLI, Args } from './cli';
import { findDependents } from './search';
import { resolveFromDirectory, resolveFromFile } from './path';

interface Accumulator {
  directory: string;
  file: string;
  matches: Set<string>;
}

const find = (next: Accumulator): Accumulator => {
  const { directory, file } = next;
  return findDependents(directory, file).reduce((acc, match) => {
    const [filePath] = resolveFromDirectory(directory, match.search).split('.');
    const importedPath = resolveFromFile(match.file, match.imported);

    if (filePath === importedPath && !acc.matches.has(match.file)) {
      acc.matches.add(match.file);
      acc.file = match.file;
      return find(acc);
    }

    return acc;
  }, next);
};

if (!module.parent) {
  CLI((argv: Args) => {
    console.log(
      find({
        directory: process.cwd(),
        file: argv.file,
        matches: new Set([resolveFromDirectory(process.cwd(), argv.file)])
      }).matches
    );
  });
}
