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
exports.NftItemCodeCell = exports.NftItemCodeBoc = exports.buildNftItemDataCell = exports.NftItem = void 0;
const ton_core_1 = require("ton-core");
class NftItem {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new NftItem(address);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildNftItemDataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.NftItemCodeCell,
                data: data
            });
            return new NftItem(address, 0, {
                code: exports.NftItemCodeCell,
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
    sendTransferEditorship(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x1c04412a, 32)
                    .storeUint(params.queryId || 0, 64)
                    .storeAddress(params.newEditor)
                    .storeAddress(params.responseTo)
                    .storeBit(false)
                    .storeCoins(params.forwardAmount || 0)
                    .storeBit(false)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
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
}
exports.NftItem = NftItem;
function buildNftItemDataCell(data) {
    let dataCell = (0, ton_core_1.beginCell)();
    let contentCell = (0, ton_core_1.beginCell)();
    // contentCell.bits.writeString(data.content)
    contentCell.storeBuffer(Buffer.from(data.content));
    dataCell.storeUint(data.index, 64);
    dataCell.storeAddress(data.collectionAddress);
    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeRef(contentCell);
    return dataCell.endCell();
}
exports.buildNftItemDataCell = buildNftItemDataCell;
// Data
exports.NftItemCodeBoc = 'te6cckECDQEAAdAAART/APSkE/S88sgLAQIBYgMCAAmhH5/gBQICzgcEAgEgBgUAHQDyMs/WM8WAc8WzMntVIAA7O1E0NM/+kAg10nCAJp/AfpA1DAQJBAj4DBwWW1tgAgEgCQgAET6RDBwuvLhTYALXDIhxwCSXwPg0NMDAXGwkl8D4PpA+kAx+gAxcdch+gAx+gAw8AIEs44UMGwiNFIyxwXy4ZUB+kDUMBAj8APgBtMf0z+CEF/MPRRSMLqOhzIQN14yQBPgMDQ0NTWCEC/LJqISuuMCXwSED/LwgCwoAcnCCEIt3FzUFyMv/UATPFhAkgEBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AAH2UTXHBfLhkfpAIfAB+kDSADH6AIIK+vCAG6EhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGOPoIQBRONkchQCc8WUAvPFnEkSRRURqBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7ABBHlBAqN1viDACCAo41JvABghDVMnbbEDdEAG1xcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wCTMDI04lUC8ANqhGIu';
exports.NftItemCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftItemCodeBoc, 'base64'))[0];
//# sourceMappingURL=NftItem.js.map