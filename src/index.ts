#!/usr/bin/env node

import { CLI, Args } from './cli';
import { getDependencyMap, File, Folder, PATH } from './search';
import { resolveFromDirectory } from './path';

interface Accumulator {
  map: Map<string, File | Folder>;
  file: string;
  matches: Set<string>;
}

export function* find(acc: Accumulator): IterableIterator<string> {
  const [fileName] = acc.file.split('.');
  const current = acc.map.get(fileName);

  if (!current) {
    return;
  }

  for (const [key, match] of acc.map) {
    if (match.imports.has(fileName) && !acc.matches.has(match[PATH])) {
      acc.matches.add(match[PATH]);
      acc.file = match[PATH];
      if (match.kind === 'file') {
        yield match[PATH];
      }
      yield* find(acc);
    }
  }
}

async function main(args: Args) {
  const file = resolveFromDirectory(args.directory, args.file);
  const map = await getDependencyMap(args.directory);

  const iter = find({
    map,
    file,
    matches: new Set([file])
  });

  const files = [];
  for (const file of iter) {
    if (args.json) {
      files.push(file);
    } else {
      console.log(file);
    }
  }

  if (args.json) {
    console.log(JSON.stringify(files, null, 2));
  }
}

if (!module.parent) {
  CLI(main);
}
