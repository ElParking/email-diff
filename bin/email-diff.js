#!/usr/bin/env node
const yargs = require('yargs')
const captureCommand = require('../commands/capture')
const testCommand = require('../commands/test')

yargs
  .command(
    'capture',
    'Capture links screenshots',
    (yargs) => {
      yargs
        .option('dir', {
          describe: 'Snapshots directory',
          type: 'string',
        })
        .option('output-dir', {
          default: 'output',
          describe: 'Screenshots output directory',
          type: 'string',
        })
        .option('headless', {
          describe: 'Run in headless mode',
          default: true,
          type: 'boolean',
        })
        .option('max', {
          describe: 'Maximum snapshots to process',
          // TODO: Review this :see_no_evil:
          default: Infinity,
          type: 'number',
        })
        .demandOption(['dir'])
    },
    (argv) => {
      captureCommand({
        dir: argv.dir,
        outputDir: argv.outputDir,
        headless: argv.headless,
        max: argv.max,
      })
    }
  )
  .command(
    'test',
    'Compare screenshots',
    (yargs) => {
      yargs
        .option('reference-dir', {
          describe: 'Screenshots reference directory',
          default: 'reference',
          type: 'string',
        })
        .option('test-dir', {
          describe: 'Screenshots test directory',
          default: 'test',
          type: 'string',
        })
        .option('output-dir', {
          describe: 'Output directory',
          default: 'output',
          type: 'string',
        })
        .option('max', {
          describe: 'Maximum snapshots to compare',
          // TODO: Review this :see_no_evil:
          default: Infinity,
          type: 'number',
        })
    },
    (argv) => {
      testCommand({
        referenceDir: argv.referenceDir,
        testDir: argv.testDir,
        outputDir: argv.outputDir,
        max: argv.max,
      })
    }
  )
  .help().argv
