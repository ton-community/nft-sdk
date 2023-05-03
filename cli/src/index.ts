#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {Pinata} from "../../src/storage/Pinata"
import {AmazonS3} from "../../src/storage/AmazonS3"
import {TonAPI} from '../../src/ton-api'
import {fetchAndParseTransactionData} from '../../src/utils/FetchAndParseTransaction'
import { Address } from 'ton-core';
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
        let imagesUrls = await pinata.uploadImagesBulk(argv.path)

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

        let s3 = new AmazonS3(argv.apiKey, argv.secretApiKey);
        let imagesUrls = await s3.uploadImagesBulk(argv.path, "nft_collection")

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


  // Command to fetch transactions and parse data
  .command(
    'transactions <address> [limit]',
    'Fetch and parse transaction data',
    (yargs) => {
      return yargs
        .positional('address', {
          describe: 'Address to fetch transactions from',
          type: 'string',
        })
        .positional('limit', {
          describe: 'Maximum number of transactions to return',
          type: 'number',
          default: 10,
        });
    },
    async (argv) => {
      if (typeof argv.address === 'string') {
        const parsedAddress = Address.parse(argv.address);
        const transactions = await fetchAndParseTransactionData(parsedAddress, argv.limit);
        console.log(transactions);
      }
    }
  )

  .command(
    'create keypair',
    'Creates Keypair',
    (yargs) => {
      
    },
    async (argv) => {
      await createKeyPair();
  })

  .command(
    'create nft-single <configPath> [secretKey]',
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
    'create nft-collection <configPath> [secretKey]',
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
