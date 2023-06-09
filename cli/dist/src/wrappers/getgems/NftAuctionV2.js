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
exports.NftAuctionV2CodeCell = exports.NftAuctionV2CodeBoc = exports.buildNftAuctionV2DataCell = exports.NftAuctionV2 = void 0;
const ton_core_1 = require("ton-core");
class NftAuctionV2 {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftAuctionV2(address);
    }
    // createFromConfig
    static createFromConfig(config) {
        let data = buildNftAuctionV2DataCell(config);
        let address = (0, ton_core_1.contractAddress)(0, {
            code: exports.NftAuctionV2CodeCell,
            data: data
        });
        return new NftAuctionV2(address, 0, {
            code: exports.NftAuctionV2CodeCell,
            data: data
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
    sendCancel(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0, 32)
                    .storeBuffer(Buffer.from('cancel'))
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendStop(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0, 32)
                    .storeBuffer(Buffer.from('cancel'))
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    getSaleData(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_sale_data', []);
            // pops out saleType
            stack.pop();
            return {
                // saleType: stack.readBigNumber(),
                end: stack.readBigNumber(),
                endTimestamp: stack.readBigNumber(),
                marketplaceAddress: stack.readAddressOpt(),
                nftAddress: stack.readAddressOpt(),
                nftOwnerAddress: stack.readAddressOpt(),
                lastBidAmount: stack.readBigNumber(),
                lastBidAddress: stack.readAddressOpt(),
                minStep: stack.readBigNumber(),
                marketplaceFeeAddress: stack.readAddressOpt(),
                marketplaceFeeFactor: stack.readBigNumber(),
                marketplaceFeeBase: stack.readBigNumber(),
                royaltyAddress: stack.readAddressOpt(),
                royaltyFactor: stack.readBigNumber(),
                royaltyBase: stack.readBigNumber(),
                maxBid: stack.readBigNumber(),
                minBid: stack.readBigNumber(),
                createdAt: stack.readBigNumber(),
                lastBidAt: stack.readBigNumber(),
                isCanceled: stack.readBigNumber(),
            };
        });
    }
}
exports.NftAuctionV2 = NftAuctionV2;
function buildNftAuctionV2DataCell(data) {
    const constantCell = (0, ton_core_1.beginCell)();
    const subGasPriceFromBid = 8449000;
    constantCell.storeUint(subGasPriceFromBid, 32);
    constantCell.storeAddress(data.marketplaceAddress);
    constantCell.storeCoins(data.minBid);
    constantCell.storeCoins(data.maxBid);
    constantCell.storeCoins(data.minStep);
    constantCell.storeUint(data.stepTimeSeconds, 32); // step_time
    constantCell.storeAddress(data.nftAddress);
    constantCell.storeUint(data.createdAtTimestamp, 32);
    const feesCell = (0, ton_core_1.beginCell)();
    feesCell.storeAddress(data.marketplaceFeeAddress); // mp_fee_addr
    feesCell.storeUint(data.marketplaceFeeFactor, 32); // mp_fee_factor
    feesCell.storeUint(data.marketplaceFeeBase, 32); // mp_fee_base
    feesCell.storeAddress(data.royaltyAddress); // royalty_fee_addr
    feesCell.storeUint(data.royaltyFactor, 32); // royalty_fee_factor
    feesCell.storeUint(data.royaltyBase, 32); // royalty_fee_base
    const storage = (0, ton_core_1.beginCell)();
    storage.storeBit(data.end); // end?
    storage.storeBit(data.activated); // activated
    storage.storeBit(false); // is_canceled
    storage.storeBuffer(Buffer.from([0, 0])); // last_member
    storage.storeCoins(0); // last_bid
    storage.storeUint(0, 32); // last_bid_at
    storage.storeUint(data.endTimestamp, 32); // end_time
    if (data.nftOwnerAddress) {
        storage.storeAddress(data.nftOwnerAddress);
    }
    else {
        storage.storeBuffer(Buffer.from([0, 0]));
    }
    storage.storeRef(feesCell.endCell());
    storage.storeRef(constantCell.endCell());
    return storage.endCell();
}
exports.buildNftAuctionV2DataCell = buildNftAuctionV2DataCell;
// Data
exports.NftAuctionV2CodeBoc = 'te6cckECHQEABZMAART/APSkE/S88sgLAQIBIAIDAgFIBAUCKPIw2zyBA+74RMD/8vL4AH/4ZNs8GxwCAs4GBwKLoDhZtnm2eQQQgqqH8IXwofCH8KfwpfCd8JvwmfCX8JXwi/Cf8IwaIiYaGCIkGBYiIhYUIiAUIT4hHCD6INggtiD0INIgsRsaAgEgCAkCASAYGQT1AHQ0wMBcbDyQPpAMNs8+ELA//hDUiDHBbCO0DMx0x8hwACNBJyZXBlYXRfZW5kX2F1Y3Rpb26BSIMcFsI6DW9s84DLAAI0EWVtZXJnZW5jeV9tZXNzYWdlgUiDHBbCa1DDQ0wfUMAH7AOAw4PhTUhDHBY6EMzHbPOABgGxIKCwATIIQO5rKAAGphIAFcMYED6fhS10nCAvLygQPqAdMfghAFE42REroS8vSAQNch+kAw+HJw+GJ/+GTbPBwEhts8IMABjzgwgQPt+CP4UL7y8oED7fhCwP/y8oED8AKCEDuaygC5EvLy+FJSEMcF+ENSIMcFsfLhkwF/2zzbPOAgwAIMFQ0OAIwgxwDA/5IwcODTHzGLZjYW5jZWyCHHBZIwceCLRzdG9wghxwWSMHLgi2ZmluaXNoghxwWSMHLgi2ZGVwbG95gBxwWRc+BwAYpwIPglghBfzD0UyMsfyz/4Us8WUAPPFhLLACH6AssAyXGAGMjLBfhTzxZw+gLLasyCCA9CQHD7AsmDBvsAf/hif/hm2zwcBPyOwzAygQPt+ELA//LygQPwAYIQO5rKALny8vgj+FC+jhf4UlIQxwX4Q1IgxwWx+E1SIMcFsfLhk5n4UlIQxwXy4ZPi2zzgwAOSXwPg+ELA//gj+FC+sZdfA4ED7fLw4PhLghA7msoAoFIgvvhLwgCw4wL4UPhRofgjueMA+E4SDxARAiwCcNs8IfhtghA7msoAofhu+CP4b9s8FRIADvhQ+FGg+HADcI6VMoED6PhKUiC58vL4bvht+CP4b9s84fhO+EygUiC5l18DgQPo8vDgAnDbPAH4bfhu+CP4b9s8HBUcApT4TsAAjj1wIPglghBfzD0UyMsfyz/4Us8WUAPPFhLLACH6AssAyXGAGMjLBfhTzxZw+gLLasyCCA9CQHD7AsmDBvsA4w5/+GLbPBMcAvrbPPhOQFTwAyDCAI4rcCCAEMjLBVAHzxYi+gIWy2oVyx+L9NYXJrZXRwbGFjZSBmZWWM8WyXL7AJE04vhOQAPwAyDCAI4jcCCAEMjLBVAEzxYi+gITy2oSyx+LdSb3lhbHR5jPFsly+wCRMeKCCA9CQHD7AvhOWKEBoSDCABoUAMCOInAggBDIywX4Us8WUAP6AhLLassfi2UHJvZml0jPFsly+wCRMOJwIPglghBfzD0UyMsfyz/4Tc8WUAPPFhLLAIIImJaA+gLLAMlxgBjIywX4U88WcPoCy2rMyYMG+wAC8vhOwQGRW+D4TvhHoSKCCJiWgKFSELyZMAGCCJiWgKEBkTLijQpWW91ciBiaWQgaGFzIGJlZW4gb3V0YmlkIGJ5IGFub3RoZXIgdXNlci6ABwP+OHzCNBtBdWN0aW9uIGhhcyBiZWVuIGNhbmNlbGxlZC6DeIcIA4w8WFwA4cCCAGMjLBfhNzxZQBPoCE8tqEssfAc8WyXL7AAACWwARIIQO5rKAKmEgAB0IMAAk18DcOBZ8AIB8AGAAIPhI0PpA0x/TH/pA0x/THzAAyvhBbt3tRNDSAAH4YtIAAfhk0gAB+Gb6QAH4bfoAAfhu0x8B+G/THwH4cPpAAfhy1AH4aNQw+Gn4SdDSHwH4Z/pAAfhj+gAB+Gr6AAH4a/oAAfhs0x8B+HH6QAH4c9MfMPhlf/hhAFT4SfhI+FD4T/hG+ET4QsjKAMoAygD4Tc8W+E76Assfyx/4Us8WzMzJ7VQBqlR8';
exports.NftAuctionV2CodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftAuctionV2CodeBoc, 'base64'))[0];
//# sourceMappingURL=NftAuctionV2.js.map