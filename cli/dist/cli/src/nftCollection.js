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
exports.importExistingNftCollection = exports.createNftCollection = void 0;
const ton_core_1 = require("ton-core");
const NftCollection_1 = require("../../src/wrappers/getgems/NftCollection");
const importKeyPair_1 = __importDefault(require("./utils/importKeyPair"));
const fs_1 = require("fs");
const process_1 = require("process");
const createSender_1 = __importDefault(require("./utils/createSender"));
function createNftCollection(client, config, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let keypair = yield (0, importKeyPair_1.default)(options === null || options === void 0 ? void 0 : options.secretKey);
        let sender = yield (0, createSender_1.default)(keypair, client);
        const nftCollection = client.open(yield NftCollection_1.NftCollection.createFromConfig(config));
        yield nftCollection.sendDeploy(sender, (0, ton_core_1.toNano)('0.05'));
        console.log(`NFT Single deployed at ${nftCollection.address}`);
        yield (0, fs_1.writeFileSync)('./NftCollection.json', JSON.stringify({
            config: config,
            address: nftCollection.address,
            init: nftCollection.init
        }));
        console.log(`Saved Config`);
        return nftCollection;
    });
}
exports.createNftCollection = createNftCollection;
function importExistingNftCollection(client, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options === null || options === void 0 ? void 0 : options.configPath) {
            const config = JSON.parse((0, fs_1.readFileSync)(options === null || options === void 0 ? void 0 : options.configPath, 'utf-8'));
            const nftCollection = client.open(yield NftCollection_1.NftCollection.createFromAddress(config.address, 0, config.init));
            return nftCollection;
        }
        else {
            const config = JSON.parse((0, fs_1.readFileSync)(String(process_1.env.PATH_TO_CONFIG), 'utf-8'));
            const nftCollection = client.open(yield NftCollection_1.NftCollection.createFromAddress(config.address, 0, config.init));
            return nftCollection;
        }
    });
}
exports.importExistingNftCollection = importExistingNftCollection;
//# sourceMappingURL=nftCollection.js.map