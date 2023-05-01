#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const uploadFunction = () => {
    console.log('Uploading NFT...');
    // Add your upload logic here
};
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('upload', 'Upload an NFT', () => { }, () => {
    uploadFunction();
})
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .alias('h', 'help')
    .strict()
    .parse();
//# sourceMappingURL=index.js.map