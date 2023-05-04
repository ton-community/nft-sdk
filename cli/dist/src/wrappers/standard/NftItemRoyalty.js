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
exports.NftItemRoyalty = void 0;
const ton_core_1 = require("ton-core");
class NftItemRoyalty {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftItemRoyalty(address);
    }
    // Deployment
    sendDeploy(provider, via, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value,
                body: (0, ton_core_1.beginCell)().endCell(),
            });
        });
    }
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
    sendGetRoyaltyParams(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x693d3950, 32)
                    .storeUint(params.queryId, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    // const { stack } = await provider.get('get_nft_address_by_index', [
    //     { type: 'int', value: index }
    // ])
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
    getRoyaltyParams(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('royalty_params', []);
            return {
                init: stack.readBoolean(),
                numerator: stack.readBigNumber(),
                denominator: stack.readBigNumber(),
                destination: stack.readAddressOpt()
            };
        });
    }
}
exports.NftItemRoyalty = NftItemRoyalty;
//# sourceMappingURL=NftItemRoyalty.js.map