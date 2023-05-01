#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {Pinata} from "../../src/storage/Pinata"

const uploadFunction = (path: string, apiKey: string) => {
  console.log(`Uploading NFT from path: ${path}`);
  console.log(`Using API key: ${apiKey}`);
  // Add your upload logic here
};

yargs(hideBin(process.argv))
  .command(
    'upload <path>',
    'Upload an NFT',
    (yargs) => {
      return yargs
        .positional('path', {
          describe: 'Path to the file to be uploaded',
          type: 'string',
        })
        .option('apiKey', {
          describe: 'API key for authentication',
          type: 'string',
          demandOption: true,
        })
        .option('secretApiKey', {
          describe: 'Secret API key for authentication',
          type: 'string',
          demandOption: true,
        });
    },
    async (argv) => {
      if (typeof argv.path === 'string' && typeof argv.apiKey === 'string' && typeof argv.secretApiKey == 'string') {
        let pinata = new Pinata(argv.apiKey, argv.secretApiKey);
        await pinata.uploadImagesBulk(argv.path)
        
      }
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('h', 'help')
  .strict()
  .parse();
