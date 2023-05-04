"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENDPOINT = exports.Pinata = exports.AmazonS3 = exports.TransactionParsing = void 0;
// Storage
const AmazonS3_1 = require("./storage/AmazonS3");
Object.defineProperty(exports, "AmazonS3", { enumerable: true, get: function () { return AmazonS3_1.AmazonS3; } });
const Pinata_1 = require("./storage/Pinata");
Object.defineProperty(exports, "Pinata", { enumerable: true, get: function () { return Pinata_1.Pinata; } });
// Wrappers
__exportStar(require("./wrappers/getgems/NftCollection"), exports);
__exportStar(require("./wrappers/getgems/NftItem"), exports);
__exportStar(require("./wrappers/getgems/SbtSingle"), exports);
__exportStar(require("./wrappers/standard/NftItemRoyalty"), exports);
__exportStar(require("./wrappers/getgems/NftAuction"), exports);
__exportStar(require("./wrappers/getgems/NftAuctionV2"), exports);
__exportStar(require("./wrappers/getgems/NftFixedPrice"), exports);
__exportStar(require("./wrappers/getgems/NftFixedPriceV2"), exports);
__exportStar(require("./wrappers/getgems/NftFixedPriceV3"), exports);
__exportStar(require("./wrappers/getgems/NftMarketplace"), exports);
__exportStar(require("./wrappers/getgems/NftOffer"), exports);
__exportStar(require("./wrappers/getgems/NftSwap"), exports);
// Utils
__exportStar(require("./utils"), exports);
// Data Encoders & Decoders
__exportStar(require("./types/OffchainContent"), exports);
// Transaction Parsing
exports.TransactionParsing = __importStar(require("./transaction-parsing/"));
__exportStar(require("./utils/FetchAndParseTransaction"), exports);
// TON API
__exportStar(require("./ton-api"), exports);
// Endpoints
var ENDPOINT;
(function (ENDPOINT) {
    ENDPOINT["MAINNET"] = "https://toncenter.com/api/v2/jsonRPC";
    ENDPOINT["TESTNET"] = "https://testnet.toncenter.com/api/v2/jsonRPC";
})(ENDPOINT = exports.ENDPOINT || (exports.ENDPOINT = {}));
//# sourceMappingURL=index.js.map