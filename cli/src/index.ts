#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {Pinata} from "../../src/storage/Pinata"
import {AmazonS3} from "../../src/storage/AmazonS3"
import {TonNftClient} from '../../src/ton-api'
import {TonAPI} from '../../src/ton-api/TonAPI'
import { Address } from 'ton-core'
import {createNftSingle, transfer} from "./nftSingle"
import {createNftCollection} from "./nftCollection"
import { TonClient4 } from 'ton';
import createKeyPair from './utils/createKeyPair';

yargs(hideBin(process.argv))
  .command(
    'upload pinata [path]',
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
        let imagesUrls = await pinata.uploadBulk(argv.path)

        console.log(`URLs: ${imagesUrls}`)
      }
    }
  )

  .command(
    'upload s3 [path]',
    'Upload an NFT via Amazon S3',
    (yargs) => {
      return yargs
        .positional('path', {
          describe: 'Path to the file to be uploaded',
          type: 'string',
          default: './assets',
        })
        .option('accessKey', {
          alias: 'k',
          describe: 'Access key for authentication',
          type: 'string',
          demandOption: true,
        })
        .option('secretAccessKey', {
          alias: 's',
          describe: 'Secret access key for authentication',
          type: 'string',
          demandOption: true,
        })
        .option('bucketName', {
          alias: 'b',
          describe: 'Bucket Name',
          type:'string',
          demandOption: true,
        })
        .option('fileType', {
          alias: 'f',
          describe: 'File type of the image',
          type: 'string',
          demandOption: true,
          default: "image/jpeg"
        });
    },
    async (argv) => {
      if (typeof argv.path === 'string' 
          && typeof argv.apiKey === 'string' 
          && typeof argv.secretApiKey == 'string'
      ) {
        console.log(`Using API key: ${argv.apiKey}`);
        console.log(`Using secret API key: ${argv.secretApiKey}`);
        console.log(`Using bucket name: ${argv.bucketName}`);

        let s3 = new AmazonS3(argv.apiKey, argv.secretApiKey, argv.bucketName);
        let imagesUrls = await s3.uploadBulk(argv.path)

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
      const tonClient = new TonNftClient(new TonAPI());
      const collections = await tonClient.getNftCollections(argv.limit, argv.offset);
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
        const tonClient = new TonNftClient(new TonAPI());
        const collection = await tonClient.getNftCollection(argv.address);
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
        const tonClient = new TonNftClient(new TonAPI());
        const items = await tonClient.getNftItems(argv.address, argv.limit, argv.offset);
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
        const tonClient = new TonNftClient(new TonAPI());
        const item = await tonClient.getNftItem(argv.address);
        console.log(item);
      }
    }
  )

  .command(
    'keypair create',
    'Creates Keypair',
    (yargs) => {
      
    },
    async (argv) => {
      await createKeyPair();
  })

  .command(
    'nft-single create <configPath> [secretKey]',
    'Create a single NFT',
    (yargs) => {
      return yargs
        .positional('configPath', {
          describe: 'Path to the NFT single data config JSON file',
          type: 'string',
        })
        .positional('secretKey', {
          describe: 'Secret key for creating the NFT',
          type: 'string',
          default: undefined,
        });
    },
    async (argv) => {
      if (typeof argv.configPath === 'string') {
        const client = new TonClient4({
          endpoint: "https://toncenter.com/api/v2/jsonRPC"
        });
        const config = require(argv.configPath);
        const options = { secretKey: argv.secretKey };
        await createNftSingle(client, config, options);
      }
    }
  )

  .command(
    'nft-single transfer <destination> [configPath] [secretKey]',
    'Transfer an NFT Single',
    (yargs) => {
      return yargs
        .positional('destination', {
          describe: 'Destination address',
          type: 'string',
        })
        .positional('configPath', {
          describe: 'Path to the transfer configuration JSON file',
          type: 'string',
          default: undefined,
        })
        .positional('secretKey', {
          describe: 'Secret key of the Sender',
          type: 'string',
          default: undefined,
        });
    },
    async (argv) => {
      if (typeof argv.destination === 'string') {
        const client = new TonClient4({
          endpoint: "https://toncenter.com/api/v2/jsonRPC"
        });

        const options = { configPath: argv.configPath, secretKey: argv.secretKey };
        await transfer(client, argv.destination, options);
      }
    }
  )

  .command(
    'nft-collection create <configPath> [secretKey]',
    'Create a NFT Collection',
    (yargs) => {
      return yargs
       .positional('configPath', {
          describe: 'Path to the NFT collection data config JSON file',
          type:'string',
        })
       .positional('secretKey', {
          describe: 'Secret key for creating the NFT',
          type:'string',
          default: undefined,
        });
        },
    async (argv) => {
      if (typeof argv.configPath ==='string') {
        const client = new TonClient4({
          endpoint: "https://toncenter.com/api/v2/jsonRPC"
        });
        const config = require(argv.configPath);
        const options = { secretKey: argv.secretKey };
        await createNftCollection(client, config, options);
      }
    }
  )

  
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('h', 'help')
  .strict()
  .parse();
