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
exports.NftFixPriceSaleV2CodeCell = exports.NftFixPriceSaleV2CodeBoc = exports.buildNftFixPriceSaleV2DataCell = exports.NftFixedPriceV2 = void 0;
const ton_core_1 = require("ton-core");
class NftFixedPriceV2 {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftFixedPriceV2(address);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildNftFixPriceSaleV2DataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.NftFixPriceSaleV2CodeCell,
                data: data
            });
            return new NftFixedPriceV2(address, 0, {
                code: exports.NftFixPriceSaleV2CodeCell,
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
    sendCoins(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(1, 32)
                    .storeUint(params.queryId, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendCancelSale(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(3, 32)
                    .storeUint(params.queryId, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendBuy(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)().
                    storeUint(params.queryId || 0, 32).
                    endCell(),
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
                isComplete: stack.readBigNumber(),
                createdAt: stack.readBigNumber(),
                marketplaceAddress: stack.readAddressOpt(),
                nftAddress: stack.readAddressOpt(),
                nftOwnerAddress: stack.readAddressOpt(),
                fullPrice: stack.readBigNumber(),
                marketplaceFeeAddress: stack.readAddressOpt(),
                marketplaceFee: stack.readBigNumber(),
                royaltyAddress: stack.readAddressOpt(),
                royaltyAmount: stack.readBigNumber()
            };
        });
    }
}
exports.NftFixedPriceV2 = NftFixedPriceV2;
function buildNftFixPriceSaleV2DataCell(data) {
    let feesCell = (0, ton_core_1.beginCell)();
    feesCell.storeAddress(data.marketplaceFeeAddress);
    feesCell.storeCoins(data.marketplaceFee);
    feesCell.storeAddress(data.royaltyAddress);
    feesCell.storeCoins(data.royaltyAmount);
    let dataCell = (0, ton_core_1.beginCell)();
    dataCell.storeUint(data.isComplete ? 1 : 0, 1);
    dataCell.storeUint(data.createdAt, 32);
    dataCell.storeAddress(data.marketplaceAddress);
    dataCell.storeAddress(data.nftAddress);
    dataCell.storeAddress(data.nftOwnerAddress);
    dataCell.storeCoins(data.fullPrice);
    dataCell.storeRef(feesCell);
    return dataCell.endCell();
}
exports.buildNftFixPriceSaleV2DataCell = buildNftFixPriceSaleV2DataCell;
// Data
exports.NftFixPriceSaleV2CodeBoc = 'te6cckECDAEAAikAART/APSkE/S88sgLAQIBIAMCAATyMAIBSAUEAFGgOFnaiaGmAaY/9IH0gfSB9AGoYaH0gfQB9IH0AGEEIIySsKAVgAKrAQICzQgGAfdmCEDuaygBSYKBSML7y4cIk0PpA+gD6QPoAMFOSoSGhUIehFqBSkHCAEMjLBVADzxYB+gLLaslx+wAlwgAl10nCArCOF1BFcIAQyMsFUAPPFgH6AstqyXH7ABAjkjQ04lpwgBDIywVQA88WAfoCy2rJcfsAcCCCEF/MPRSBwCCIYAYyMsFKs8WIfoCy2rLHxPLPyPPFlADzxbKACH6AsoAyYMG+wBxVVAGyMsAFcsfUAPPFgHPFgHPFgH6AszJ7VQC99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqGBNgAPloyhFrpOEBWccgGRwcKaDjgskvhHAoomOC+XD6AmmPwQgCicbIiV15cPrpn5j9IBggKwNkZYAK5Y+oAeeLAOeLAOeLAP0BZmT2qnAbE+OAcYED6Y/pn5gQwLCQFKwAGSXwvgIcACnzEQSRA4R2AQJRAkECPwBeA6wAPjAl8JhA/y8AoAyoIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxnLPyfPFifPFhjKACf6AhfKAMmAQPsAcQZQREUVBsjLABXLH1ADzxYBzxYBzxYB+gLMye1UABY3EDhHZRRDMHDwBTThaBI=';
exports.NftFixPriceSaleV2CodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftFixPriceSaleV2CodeBoc, 'base64'))[0];
//# sourceMappingURL=NftFixedPriceV2.js.map