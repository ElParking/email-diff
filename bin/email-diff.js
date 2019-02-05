#!/usr/bin/env node
const yargs = require('yargs')
const captureCommand = require('../commands/capture')
const testCommand = require('../commands/test')

yargs
  .command(
    'capture <site>',
    'Capture links screenshots',
    (yargs) => {
      yargs
        .positional('site', {
          describe: 'site pages to capture',
        })
        .option('dir', {
          describe: 'Screenshots output directory',
        })
        .option('headless', {
          describe: 'Run in headless mode',
          default: false,
        })
        .demandOption(['dir'])
    },
    (argv) => {
      captureCommand({
        host: argv.site,
        screenshotsPath: argv.dir,
        headless: argv.headless,
      })
    }
  )
  .command(
    'test',
    'Test screenshots',
    (yargs) => {
      yargs
        .option('dir', {
          describe: 'Output directory',
        })
        .option('reference-dir', {
          describe: 'Screenshots reference directory',
        })
        .option('test-dir', {
          describe: 'Screenshots test directory',
        })
        .demandOption(['dir', 'reference-dir', 'test-dir'])
    },
    (argv) => {
      testCommand({
        outputPath: argv.dir,
        referencePath: argv.referenceDir,
        testPath: argv.testDir,
      })
    }
  )
  .help().argv
