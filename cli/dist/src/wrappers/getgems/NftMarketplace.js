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
exports.NftMarketplaceCodeCell = exports.NftMarketplaceCodeBoc = exports.buildSignature = exports.buildNftMarketplaceDataCell = exports.NftMarketplace = void 0;
const ton_core_1 = require("ton-core");
const ton_crypto_1 = require("ton-crypto");
class NftMarketplace {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftMarketplace(address);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildNftMarketplaceDataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.NftMarketplaceCodeCell,
                data: data
            });
            return new NftMarketplace(address, 0, {
                code: exports.NftMarketplaceCodeCell,
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
}
exports.NftMarketplace = NftMarketplace;
function buildNftMarketplaceDataCell(data) {
    let dataCell = (0, ton_core_1.beginCell)();
    dataCell.storeUint(data.seqno, 32);
    dataCell.storeUint(data.subwallet, 32);
    dataCell.storeBuffer(data.publicKey);
    return dataCell.endCell();
}
exports.buildNftMarketplaceDataCell = buildNftMarketplaceDataCell;
function buildSignature(params) {
    let bodyCell = (0, ton_core_1.beginCell)();
    bodyCell.storeRef(params.saleStateInit);
    bodyCell.storeRef(params.saleMessageBody);
    return (0, ton_crypto_1.sign)(bodyCell.endCell().hash(), params.keyPair.secretKey);
}
exports.buildSignature = buildSignature;
// Data
exports.NftMarketplaceCodeBoc = 'te6cckEBDAEA7wABFP8A9KQT9LzyyAsBAgEgAwIAePKDCNcYINMf0x/THwL4I7vyY/ABUTK68qFRRLryogT5AVQQVfkQ8qP4AJMg10qW0wfUAvsA6DABpALwAgIBSAcEAgFIBgUAEbjJftRNDXCx+AAXuznO1E0NM/MdcL/4AgLOCQgAF0AsjLH8sfy//J7VSAIBIAsKABU7UTQ0x/TH9P/MIACpGwiIMcAkVvgAdDTAzBxsJEw4PABbCEB0x8BwAGONIMI1xgg+QFAA/kQ8qPU1DAh+QBwyMoHy//J0Hd0gBjIywXLAljPFnD6AstrEszMyYBA+wDgW4NC26jQ=';
exports.NftMarketplaceCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftMarketplaceCodeBoc, 'base64'))[0];
//# sourceMappingURL=NftMarketplace.js.map