#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const Pinata_1 = require("../../src/storage/Pinata");
const AmazonS3_1 = require("../../src/storage/AmazonS3");
const ton_api_1 = require("../../src/ton-api");
const FetchAndParseTransaction_1 = require("../../src/utils/FetchAndParseTransaction");
const ton_core_1 = require("ton-core");
const nftSingle_1 = require("./nftSingle");
const nftCollection_1 = require("./nftCollection");
const ton_1 = require("ton");
const createKeyPair_1 = __importDefault(require("./utils/createKeyPair"));
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('upload pinata [path]', 'Upload an NFT via Pinata', (yargs) => {
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
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.path === 'string'
        && typeof argv.apiKey === 'string'
        && typeof argv.secretApiKey == 'string') {
        console.log(`Using API key: ${argv.apiKey}`);
        console.log(`Using secret API key: ${argv.secretApiKey}`);
        let pinata = new Pinata_1.Pinata(argv.apiKey, argv.secretApiKey);
        let imagesUrls = yield pinata.uploadBulk(argv.path);
        console.log(`URLs: ${imagesUrls}`);
    }
}))
    .command('upload s3 [path]', 'Upload an NFT via Amazon S3', (yargs) => {
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
        .option('fileType', {
        alias: 'f',
        describe: 'File type of the image',
        type: 'string',
        demandOption: true,
        default: "image/jpeg"
    });
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.path === 'string'
        && typeof argv.apiKey === 'string'
        && typeof argv.secretApiKey == 'string') {
        console.log(`Using API key: ${argv.apiKey}`);
        console.log(`Using secret API key: ${argv.secretApiKey}`);
        let s3 = new AmazonS3_1.AmazonS3(argv.apiKey, argv.secretApiKey);
        let imagesUrls = yield s3.uploadBulk(argv.path, "nft_collection", {
            type: `image/${argv.fileType}`
        });
        console.log(`URLs: ${imagesUrls}`);
    }
}))
    // New command for getNftCollections
    .command('collections [limit] [offset]', 'Get NFT collections', (yargs) => {
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
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const tonClient = new ton_api_1.TonClient();
    const collections = yield tonClient.getNftCollections(argv.limit, argv.offset);
    console.log(collections);
}))
    // New command for getNftCollectionByAddress
    .command('collection <address>', 'Get NFT collection by address', (yargs) => {
    return yargs.positional('address', {
        describe: 'Collection address',
        type: 'string',
    });
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.address === 'string') {
        const tonClient = new ton_api_1.TonClient();
        const collection = yield tonClient.getNftCollectionByAddress(argv.address);
        console.log(collection);
    }
}))
    // New command for getNftItemsFromCollectionByAddress
    .command('collection-items <address> [limit] [offset]', 'Get NFT items from collection by address', (yargs) => {
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
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.address === 'string') {
        const tonClient = new ton_api_1.TonClient();
        const items = yield tonClient.getNftItemsFromCollectionByAddress(argv.address, argv.limit, argv.offset);
        console.log(items);
    }
}))
    // New command for getNftItemByAddress
    .command('item <address>', 'Get NFT item by its address', (yargs) => {
    return yargs.positional('address', {
        describe: 'Item address',
        type: 'string',
    });
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.address === 'string') {
        const tonClient = new ton_api_1.TonClient();
        const item = yield tonClient.getNftItemByAddress(argv.address);
        console.log(item);
    }
}))
    // Command to fetch transactions and parse data
    .command('transactions <address> [limit]', 'Fetch and parse transaction data', (yargs) => {
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
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.address === 'string') {
        const parsedAddress = ton_core_1.Address.parse(argv.address);
        const transactions = yield (0, FetchAndParseTransaction_1.fetchAndParseTransactionData)(parsedAddress, argv.limit);
        console.log(transactions);
    }
}))
    .command('create keypair', 'Creates Keypair', (yargs) => {
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, createKeyPair_1.default)();
}))
    .command('create nft-single <configPath> [secretKey]', 'Create a single NFT', (yargs) => {
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
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.configPath === 'string') {
        const client = new ton_1.TonClient4({
            endpoint: "https://toncenter.com/api/v2/jsonRPC"
        });
        const config = require(argv.configPath);
        const options = { secretKey: argv.secretKey };
        yield (0, nftSingle_1.createNftSingle)(client, config, options);
    }
}))
    .command('nft-single transfer <destination> [configPath] [secretKey]', 'Transfer an NFT Single', (yargs) => {
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
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.destination === 'string') {
        const client = new ton_1.TonClient4({
            endpoint: "https://toncenter.com/api/v2/jsonRPC"
        });
        const options = { configPath: argv.configPath, secretKey: argv.secretKey };
        yield (0, nftSingle_1.transfer)(client, argv.destination, options);
    }
}))
    .command('create nft-collection <configPath> [secretKey]', 'Create a NFT Collection', (yargs) => {
    return yargs
        .positional('configPath', {
        describe: 'Path to the NFT collection data config JSON file',
        type: 'string',
    })
        .positional('secretKey', {
        describe: 'Secret key for creating the NFT',
        type: 'string',
        default: undefined,
    });
}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof argv.configPath === 'string') {
        const client = new ton_1.TonClient4({
            endpoint: "https://toncenter.com/api/v2/jsonRPC"
        });
        const config = require(argv.configPath);
        const options = { secretKey: argv.secretKey };
        yield (0, nftCollection_1.createNftCollection)(client, config, options);
    }
}))
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .alias('h', 'help')
    .strict()
    .parse();
//# sourceMappingURL=index.js.map