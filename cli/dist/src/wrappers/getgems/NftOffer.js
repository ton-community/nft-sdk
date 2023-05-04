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
exports.NftOfferCodeCell = exports.buildNftOfferDataCell = exports.NftOffer = void 0;
const ton_core_1 = require("ton-core");
class NftOffer {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftOffer(address);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildNftOfferDataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.NftOfferCodeCell,
                data: data
            });
            return new NftOffer(address, 0, {
                code: exports.NftOfferCodeCell,
                data: data
            });
        });
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
    sendCancelOffer(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextPayload = (0, ton_core_1.beginCell)();
            if (params.message) {
                nextPayload.storeUint(0, 32);
                const m = Buffer.from(params.message.substring(0, 121), 'utf-8');
                nextPayload.storeBuffer(m.slice(0, 121));
            }
            nextPayload.endCell();
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0, 32)
                    .storeBuffer(Buffer.from('cancel'))
                    .storeRef(nextPayload)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendCancelOfferByMarketplace(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextPayload = (0, ton_core_1.beginCell)();
            if (params.message) {
                nextPayload.storeUint(0, 32);
                const m = Buffer.from(params.message.substring(0, 121), 'utf-8');
                nextPayload.storeBuffer(m.slice(0, 121));
            }
            nextPayload.endCell();
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(3, 32)
                    .storeCoins(params.amount)
                    .storeRef(nextPayload)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    getOfferData(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_offer_data', []);
            return {
                offerType: stack.readBigNumber(),
                isComplete: stack.readBoolean(),
                createdAt: stack.readBigNumber(),
                finishAt: stack.readBigNumber(),
                marketplaceAddress: stack.readAddress(),
                nftAddress: stack.readAddress(),
                offerOwnerAddress: stack.readAddress(),
                fullPrice: stack.readBigNumber(),
                marketplaceFeeAddress: stack.readAddress(),
                marketplaceFactor: stack.readBigNumber(),
                marketplaceBase: stack.readBigNumber(),
                royaltyAddress: stack.readAddress(),
                royaltyFactor: stack.readBigNumber(),
                royaltyBase: stack.readBigNumber(),
                profitPrice: stack.readBigNumber(),
            };
        });
    }
}
exports.NftOffer = NftOffer;
function buildNftOfferDataCell(data) {
    const feesCell = (0, ton_core_1.beginCell)();
    feesCell.storeAddress(data.marketplaceFeeAddress);
    feesCell.storeUint(data.marketplaceFactor, 32);
    feesCell.storeUint(data.marketplaceBase, 32);
    feesCell.storeAddress(data.royaltyAddress);
    feesCell.storeUint(data.royaltyFactor, 32);
    feesCell.storeUint(data.royaltyBase, 32);
    const dataCell = (0, ton_core_1.beginCell)();
    dataCell.storeUint(data.isComplete ? 1 : 0, 1);
    dataCell.storeUint(data.createdAt, 32);
    dataCell.storeUint(data.finishAt, 32);
    dataCell.storeAddress(data.marketplaceAddress);
    dataCell.storeAddress(data.nftAddress);
    dataCell.storeAddress(data.offerOwnerAddress);
    dataCell.storeCoins(data.fullPrice); // fullPrice
    dataCell.storeRef(feesCell);
    dataCell.storeUint(1, 1); // can_deploy
    return dataCell.endCell();
}
exports.buildNftOfferDataCell = buildNftOfferDataCell;
// Data
const NftOfferCodeBoc = 'te6cckECFgEABEkAART/APSkE/S88sgLAQIBIAQCAVby7UTQ0wDTH9Mf+kD6QPpA+gDU0wAwMAfAAfLRlPgjJb7jAl8IggD//vLwAwDOB9MfgQ+jAsMAEvLygQ+kIddKwwDy8oEPpSHXSYEB9Lzy8vgAgggPQkBw+wJwIIAQyMsFJM8WIfoCy2rLHwHPFsmDBvsAcQdVBXAIyMsAF8sfFcsfUAPPFgHPFgHPFgH6AszLAMntVAIBSAYFAIOhRh/aiaGmAaY/pj/0gfSB9IH0AammAGBhofSBpj+mP/SBpj+mPmCo7CHgBqjuqeAGpQVCA0MEMJ6MjIqkHYACq4ECAswLBwP322ERFofSBpj+mP/SBpj+mPmBSs+AGqJCH4Aam4UJHQxbKDk3szS6QTrLgQQAhkZYKoAueLKAH9AQnltWWPgOeLZLj9gBFhABFrpOEBWEk2EPGGkGEASK3xhrgQQQgv5h6KZGWPieWfk2eLKAHni2UAQQRMS0B9AWUAZLjAoJCAB4gBjIywUmzxZw+gLLasyCCA9CQHD7AsmDBvsAcVVgcAjIywAXyx8Vyx9QA88WAc8WAc8WAfoCzMsAye1UAEyLlPZmZlciBmZWWHAggBDIywVQBc8WUAP6AhPLassfAc8WyXH7AABYi+T2ZmZXIgcm95YWxpZXOBNwIIAQyMsFUAXPFlAD+gITy2rLHwHPFslx+wACAUgPDAIBIA4NAB0IMAAk18DcOBZ8AIB8AGAAESCEDuaygCphIAIBIBEQABMghA7msoAAamEgAfcAdDTAwFxsJJfBOD6QDDtRNDTANMf0x/6QPpA+kD6ANTTADDAAY4lMTc3OFUzEnAIyMsAF8sfFcsfUAPPFgHPFgHPFgH6AszLAMntVOB/KscBwACOGjAJ0x8hwACLZjYW5jZWyFIgxwWwknMy3lCq3iCBAiu6KcABsFOmgEgLQxwWwnhCsXwzUMNDTB9QwAfsA4IIQBRONkVIQuuMCPCfAAfLRlCvAAFOTxwWwjis4ODlQdqAQN0ZQRAMCcAjIywAXyx8Vyx9QA88WAc8WAc8WAfoCzMsAye1U4Dc5CcAD4wJfCYQP8vAVEwGsU1jHBVNixwWx8uHKgggPQkBw+wJRUccFjhQ1cIAQyMsFKM8WIfoCy2rJgwb7AOMNcUcXUGYFBANwCMjLABfLHxXLH1ADzxYBzxYBzxYB+gLMywDJ7VQUALYF+gAhghAdzWUAvJeCEB3NZQAy3o0EE9mZmVyIGNhbmNlbCBmZWWBURzNwIIAQyMsFUAXPFlAD+gITy2rLHwHPFslx+wDUMHGAEMjLBSnPFnD6AstqzMmDBvsAAMYwCdM/+kAwU5THBQnAABmwK4IQO5rKAL6wnjgQWhBJEDhHFQNEZPAIjjg5XwYzM3AgghBfzD0UyMsfE8s/I88WUAPPFsoAIfoCygDJcYAYyMsFUAPPFnD6AhLLaszJgED7AOK1Lpfy';
exports.NftOfferCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(NftOfferCodeBoc, 'base64'))[0];
//# sourceMappingURL=NftOffer.js.map