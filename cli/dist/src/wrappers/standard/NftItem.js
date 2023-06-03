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
exports.NftItem = void 0;
const ton_core_1 = require("ton-core");
const EligibleInternalTx_1 = require("../../utils/EligibleInternalTx");
/**
 * Represents an NFT item contract.
 */
class NftItem {
    constructor(address, init) {
        this.address = address;
        this.init = init;
    }
    /**
     * Sends a transfer from the contract.
     * @param provider - The ContractProvider to facilitate the transfer.
     * @param via - The Sender initiating the transfer.
     * @param params - The parameters for the transfer.
     */
    sendTransfer(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x5fcc3d14, 32)
                    .storeUint(params.queryId, 64)
                    .storeAddress(params.newOwner)
                    .storeAddress(params.responseDestination)
                    .storeMaybeRef(params.customPayload)
                    .storeCoins(params.forwardAmount)
                    .storeMaybeRef(params.forwardPayload)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    /**
     * Gets static data from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @param via - The Sender initiating the data retrieval.
     * @param params - The parameters for the data retrieval.
     */
    sendGetStaticData(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x2fcb26a2, 32)
                    .storeUint(params.queryId || 0, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    // Getter Functions
    /**
     * Retrieves the data of the NFT from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     */
    getNftData(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_nft_data', []);
            return {
                init: stack.readBoolean(),
                index: stack.readBigNumber(),
                collectionAddress: stack.readAddressOpt(),
                ownerAddress: stack.readAddressOpt(),
                individualContent: stack.readCellOpt(),
            };
        });
    }
    // Transaction Parsing
    /**
     * Parses a transfer transaction.
     * @param tx - The Transaction to be parsed.
     * @returns A NftTransfer object if the transaction is valid, undefined otherwise.
     */
    static parseTransfer(tx) {
        var _a, _b, _c;
        try {
            const body = (_a = tx.inMessage) === null || _a === void 0 ? void 0 : _a.body.beginParse();
            if (body === undefined)
                return undefined;
            const op = body.loadUint(32);
            if (op !== 0x5fcc3d14)
                return undefined;
            if (!(0, EligibleInternalTx_1.isEligibleTransaction)(tx)) {
                return undefined;
            }
            return {
                queryId: body.loadUint(64),
                from: (_c = (_b = tx.inMessage) === null || _b === void 0 ? void 0 : _b.info.src) !== null && _c !== void 0 ? _c : undefined,
                to: body.loadAddress(),
                responseTo: body.loadAddress(),
                customPayload: body.loadMaybeRef(),
                forwardAmount: body.loadCoins(),
                forwardPayload: body.loadMaybeRef(),
            };
        }
        catch (e) {
            console.log(e);
        }
        return undefined;
    }
}
exports.NftItem = NftItem;
//# sourceMappingURL=NftItem.js.map