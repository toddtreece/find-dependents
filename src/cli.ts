import * as yargs from 'yargs';
import { resolve } from 'path';

export interface Args {
  json: boolean;
  file: string;
  directory: string;
}

const builder = (yargs: yargs.Argv) => {
  return yargs
    .positional('file', {
      describe: 'target file',
      demandOption: true,
      type: 'string'
    })
    .options({
      json: {
        type: 'boolean',
        default: false,
        describe: 'json output'
      },
      directory: {
        alias: 'dir',
        normalize: true,
        type: 'string',
        default: process.cwd(),
        coerce: resolve,
        describe: 'directory to search'
      }
    });
};

export const CLI = async (main: (args: Args) => void) => {
  yargs.usage('$0 [options] <file>', 'Recursively find dependents of a file', builder, main).argv;
};
