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
exports.TonAPI = void 0;
class TonAPI {
    constructor(url) {
        this.url = url ? url : "https://tonapi.io";
    }
    // Get NFT collections - /v2/nfts/collections
    getNftCollections(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield request(`${this.url}/v2/nfts/collections?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        });
    }
    // Get NFT collection by collection address - /v2/nfts/collections/{account_id}
    getNftCollectionByAddress(collectionAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield request(`${this.url}/v2/nfts/collections/${collectionAddress}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        });
    }
    // Get NFT items from collection by collection address - /v2/nfts/collections/{account_id}/items
    getNftItemsFromCollectionByAddress(collectionAddress, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield request(`${this.url}/v2/nfts/collections/${collectionAddress}/items?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        });
    }
    // Get NFT item by its address - /v2/nfts/{account_id}
    getNftItemByAddress(itemAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield request(`${this.url}/v2/nfts/${itemAddress}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        });
    }
    // Get Transactions By Address - /v1/blockchain/getTransactions
    getTransactionsByAddress(address, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield request(`${this.url}/v1/blockchain/getTransactions?account=${address.toString()}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response;
        });
    }
}
exports.TonAPI = TonAPI;
function request(url, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url, config);
        return yield response.json();
    });
}
//# sourceMappingURL=index.js.map