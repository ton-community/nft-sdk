#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {Pinata} from "../../src/storage/Pinata"
import {TonAPI} from '../../src/ton-api'

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
  // New command for getNftCollections
  .command(
    'collections [limit] [offset]',
    'Get NFT collections',
    (yargs) => {
      return yargs
        .positional('limit', {
          describe: 'Maximum number of collections to return',
          type: 'number',
          default: 10,
        })
        .positional('offset', {
          describe: 'Number of collections to skip',
          type: 'number',
          default: 0,
        });
    },
    async (argv) => {
      const tonApi = new TonAPI();
      const collections = await tonApi.getNftCollections(argv.limit, argv.offset);
      console.log(collections);
    }
  )
  // New command for getNftCollectionByAddress
  .command(
    'collection <address>',
    'Get NFT collection by address',
    (yargs) => {
      return yargs.positional('address', {
        describe: 'Collection address',
        type: 'string',
      });
    },
    async (argv) => {
      if (typeof argv.address === 'string') {
        const tonApi = new TonAPI();
        const collection = await tonApi.getNftCollectionByAddress(argv.address);
        console.log(collection);
      }
    }
  )
  // New command for getNftItemsFromCollectionByAddress
  .command(
    'collection-items <address> [limit] [offset]',
    'Get NFT items from collection by address',
    (yargs) => {
      return yargs
        .positional('address', {
          describe: 'Collection address',
          type: 'string',
        })
        .positional('limit', {
          describe: 'Maximum number of items to return',
          type: 'number',
          default: 10,
        })
        .positional('offset', {
          describe: 'Number of items to skip',
          type: 'number',
          default: 0,
        });
    },
    async (argv) => {
      if (typeof argv.address === 'string') {
        const tonApi = new TonAPI();
        const items = await tonApi.getNftItemsFromCollectionByAddress(argv.address, argv.limit, argv.offset);
        console.log(items);
      }
    }
  )

  // New command for getNftItemByAddress
  .command(
    'item <address>',
    'Get NFT item by its address',
    (yargs) => {
      return yargs.positional('address', {
        describe: 'Item address',
        type: 'string',
      });
    },
    async (argv) => {
      if (typeof argv.address === 'string') {
        const tonApi = new TonAPI();
        const item = await tonApi.getNftItemByAddress(argv.address);
        console.log(item);
      }
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('h', 'help')
  .strict()
  .parse();
