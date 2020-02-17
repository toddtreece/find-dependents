#!/usr/bin/env node

import { CLI, Args } from './cli';
import { findDependents } from './search';
import { resolveFromDirectory, resolveFromFile } from './path';

interface Accumulator {
  directory: string;
  file: string;
  matches: Set<string>;
}

async function* find(acc: Accumulator): AsyncGenerator<string> {
  const { directory, file } = acc;

  const matches = findDependents(directory, file);

  for await (const match of matches) {
    const [filePath] = resolveFromDirectory(directory, match.search).split('.');
    const importedPath = resolveFromFile(match.file, match.imported);

    if (filePath === importedPath && !acc.matches.has(match.file)) {
      acc.matches.add(match.file);
      acc.file = match.file;
      yield match.file;
      yield* find(acc);
    }
  }
}

if (!module.parent) {
  CLI(async (args: Args) => {
    const files = [];
    const iter = find({
      directory: args.directory,
      file: args.file,
      matches: new Set([resolveFromDirectory(args.directory, args.file)])
    });

    for await (const file of iter) {
      if (args.json) {
        files.push(file);
      } else {
        console.log(file);
      }
    }

    if (args.json) {
      console.log(JSON.stringify(files, null, 2));
    }
  });
}
