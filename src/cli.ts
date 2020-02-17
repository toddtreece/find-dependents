import * as yargs from 'yargs';

export interface Args {
  json: boolean;
  file: string;
}

const builder = (yargs: yargs.Argv) => {
  return yargs
    .positional('file', {
      describe: 'target file',
      demandOption: true,
      type: 'string'
    })
    .options({
      json: { type: 'boolean', default: false }
    });
};

export const CLI = async (main: (args: Args) => void) => {
  yargs.usage('$0 [options] <file>', 'Recursively find dependents of a file', builder, main).argv;
};
