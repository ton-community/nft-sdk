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
exports.NftFixPriceSaleCodeCell = exports.NftFixPriceSaleCodeBoc = exports.buildNftFixPriceSaleDataCell = exports.NftFixedPrice = void 0;
const ton_core_1 = require("ton-core");
class NftFixedPrice {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftFixedPrice(address);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildNftFixPriceSaleDataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.NftFixPriceSaleCodeCell,
                data: data
            });
            return new NftFixedPrice(address, 0, {
                code: exports.NftFixPriceSaleCodeCell,
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
    getSaleData(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_sale_data', []);
            return {
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
exports.NftFixedPrice = NftFixedPrice;
function buildNftFixPriceSaleDataCell(data) {
    let feesCell = (0, ton_core_1.beginCell)();
    feesCell.storeCoins(data.marketplaceFee);
    feesCell.storeAddress(data.marketplaceFeeAddress);
    feesCell.storeAddress(data.royaltyAddress);
    feesCell.storeCoins(data.royaltyAmount);
    let dataCell = (0, ton_core_1.beginCell)();
    dataCell.storeAddress(data.marketplaceAddress);
    dataCell.storeAddress(data.nftAddress);
    dataCell.storeAddress(data.nftOwnerAddress);
    dataCell.storeCoins(data.fullPrice);
    dataCell.storeRef(feesCell);
    return dataCell.endCell();
}
exports.buildNftFixPriceSaleDataCell = buildNftFixPriceSaleDataCell;
// Data
exports.NftFixPriceSaleCodeBoc = 'te6cckECCgEAAbIAART/APSkE/S88sgLAQIBIAMCAATyMAIBSAUEADegOFnaiaH0gfSB9IH0AahhofQB9IH0gfQAYCBHAgLNCAYB99G8EIHc1lACkgUCkQX3lw4QFofQB9IH0gfQAYOEAIZGWCqATniyi6UJDQqFrQilAK/QEK5bVkuP2AOEAIZGWCrGeLKAP9AQtltWS4/YA4QAhkZYKsZ4ssfQFltWS4/YA4EEEIL+YeihDADGRlgqgC54sRfQEKZbUJ5Y+JwHAC7LPyPPFlADzxYSygAh+gLKAMmBAKD7AAH30A6GmBgLjYSS+CcH0gGHaiaH0gfSB9IH0AahgRa6ThAVnHHZkbGymQ44LJL4NwKJFjgvlw+gFpj8EIAonGyIldeXD66Z+Y/SAYIBpkKALniygB54sA54sA/QFmZPaqcBNjgEybCBsimYI4eAJwA2mP6Z+YEOAAyS+FcBDAkAtsACmjEQRxA2RUAS8ATgMjQ0NDXAA449ghA7msoAE77y4clwIIIQX8w9FCGAEMjLBVAHzxYi+gIWy2oVyx8Tyz8hzxYBzxYSygAh+gLKAMmBAKD7AOBfBIQP8vCVeDe4';
exports.NftFixPriceSaleCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftFixPriceSaleCodeBoc, 'base64'))[0];
//# sourceMappingURL=NftFixedPrice.js.map