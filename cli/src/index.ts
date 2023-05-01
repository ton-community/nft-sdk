#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {Pinata} from "../../src/storage/Pinata"

yargs(hideBin(process.argv))
  .command(
    'upload [path]',
    'Upload an NFT via Pinata',
    (yargs) => {
      return yargs
        .positional('path', {
          describe: 'Path to the file to be uploaded',
          type: 'string',
          default: './assets',
        })
        .option('apiKey', {
          alias: 'k',
          describe: 'API key for authentication',
          type: 'string',
          demandOption: true,
        })
        .option('secretApiKey', {
          alias: 's',
          describe: 'Secret API key for authentication',
          type: 'string',
          demandOption: true,
        });
    },
    async (argv) => {
      if (typeof argv.path === 'string' 
          && typeof argv.apiKey === 'string' 
          && typeof argv.secretApiKey == 'string'
      ) {
        console.log(`Using API key: ${argv.apiKey}`);
        console.log(`Using secret API key: ${argv.secretApiKey}`);

        let pinata = new Pinata(argv.apiKey, argv.secretApiKey);
        let imagesUrls = await pinata.uploadImagesBulk(argv.path)

        console.log(`URLs: ${imagesUrls}`)
      }
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('h', 'help')
  .strict()
  .parse();
