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
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('upload [path]', 'Upload an NFT', (yargs) => {
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
        let imagesUrls = yield pinata.uploadImagesBulk(argv.path);
        console.log(`URLs: ${imagesUrls}`);
    }
}))
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .alias('h', 'help')
    .strict()
    .parse();
//# sourceMappingURL=index.js.map