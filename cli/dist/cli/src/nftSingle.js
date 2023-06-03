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
exports.transfer = exports.importExistingNftSingle = exports.createNftSingle = void 0;
const ton_core_1 = require("ton-core");
const NftSingle_1 = require("../../src/wrappers/getgems/NftSingle/NftSingle");
const importKeyPair_1 = __importDefault(require("./utils/importKeyPair"));
const fs_1 = require("fs");
const process_1 = require("process");
const ton_core_2 = require("ton-core");
const createSender_1 = __importDefault(require("./utils/createSender"));
function createNftSingle(client, config, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let keypair = yield (0, importKeyPair_1.default)(options === null || options === void 0 ? void 0 : options.secretKey);
        let sender = yield (0, createSender_1.default)(keypair, client);
        const nftSingle = client.open(yield NftSingle_1.NftSingle.createFromConfig(config));
        yield nftSingle.sendDeploy(sender, (0, ton_core_1.toNano)('0.05'));
        console.log(`NFT Single deployed at ${nftSingle.address}`);
        yield (0, fs_1.writeFileSync)('./nftSingle.json', JSON.stringify({
            config: config,
            address: nftSingle.address,
            init: nftSingle.init
        }));
        console.log(`Saved Config`);
        return nftSingle;
    });
}
exports.createNftSingle = createNftSingle;
function importExistingNftSingle(client, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options === null || options === void 0 ? void 0 : options.configPath) {
            const config = JSON.parse((0, fs_1.readFileSync)(options === null || options === void 0 ? void 0 : options.configPath, 'utf-8'));
            const nftSingle = client.open(yield NftSingle_1.NftSingle.createFromAddress(config.address));
            return nftSingle;
        }
        else {
            const config = JSON.parse((0, fs_1.readFileSync)(String(process_1.env.PATH_TO_CONFIG), 'utf-8'));
            const nftSingle = client.open(yield NftSingle_1.NftSingle.createFromAddress(config.address));
            return nftSingle;
        }
    });
}
exports.importExistingNftSingle = importExistingNftSingle;
function transfer(client, destination, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const nftSingle = yield importExistingNftSingle(client, options);
        let keypair = yield (0, importKeyPair_1.default)(options === null || options === void 0 ? void 0 : options.secretKey);
        let sender = yield (0, createSender_1.default)(keypair, client);
        let tx = yield nftSingle.sendTransfer(sender, {
            value: (0, ton_core_1.toNano)('0.05'),
            queryId: (0, ton_core_1.toNano)('0'),
            newOwner: ton_core_2.Address.parse(destination),
            responseDestination: sender.address,
            forwardAmount: (0, ton_core_1.toNano)('0')
        });
        console.log(`Transferred NFT from ${(_a = sender.address) === null || _a === void 0 ? void 0 : _a.toString()} to ${destination}`);
    });
}
exports.transfer = transfer;
//# sourceMappingURL=nftSingle.js.map