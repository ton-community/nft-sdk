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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TonNftClient = void 0;
class TonNftClient {
    constructor(client) {
        this.client = client;
    }
    getNftCollections(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.getNftCollections(limit, offset);
        });
    }
    getNftCollection(collectionAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.getNftCollection(collectionAddress);
        });
    }
    getNftItems(collectionAddress, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.getNftItems(collectionAddress, limit, offset);
        });
    }
    getNftItem(itemAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.getNftItem(itemAddress);
        });
    }
    getTransactionsByAddress(address, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.getTransactionsByAddress(address, limit);
        });
    }
}
exports.TonNftClient = TonNftClient;
//# sourceMappingURL=index.js.map