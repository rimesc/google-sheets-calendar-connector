import * as yargs from 'yargs';

import { clear, run } from "./main";

yargs
  .option('dry-run', {
    description: 'Log the changes that would have been made',
    boolean: true
  })
  .command('*', 'Update the calendar using data from the spreadsheet', args => args, ({ dryRun }) => run(dryRun))
  .command('clear', 'Clear all events from the calendar', args => args, ({ dryRun }) => clear(dryRun))
  .help()
  .argv;
