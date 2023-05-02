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
exports.NftSingleCodeCell = exports.NftSingleCodeBoc = exports.NftSingleSource = exports.buildeNftSingleDataCell = exports.NftSingle = void 0;
const ton_core_1 = require("ton-core");
const OffchainContent_1 = require("../../types/OffchainContent");
const combineFunc_1 = require("../../utils/combineFunc");
class NftSingle {
    constructor(address, workchain, init) {
        this.init = init;
        this.address = (0, ton_core_1.contractAddress)(workchain, this.init);
    }
    static createFromAddress(address, workchain, init) {
        return new NftSingle(address, workchain, init);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildeNftSingleDataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.NftSingleCodeCell,
                data: data
            });
            return new NftSingle(address, 0, {
                code: exports.NftSingleCodeCell,
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
exports.NftSingle = NftSingle;
function buildeNftSingleDataCell(data) {
    let dataCell = (0, ton_core_1.beginCell)();
    let contentCell = (0, OffchainContent_1.encodeOffChainContent)(data.content);
    let royaltyCell = (0, ton_core_1.beginCell)();
    royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16);
    royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16);
    royaltyCell.storeAddress(data.royaltyParams.royaltyAddress);
    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeAddress(data.editorAddress);
    dataCell.storeRef(contentCell);
    dataCell.storeRef(royaltyCell);
    return dataCell.endCell();
}
exports.buildeNftSingleDataCell = buildeNftSingleDataCell;
// Data
exports.NftSingleSource = (0, combineFunc_1.combineFunc)(__dirname, [
    '../../sources/stdlib.fc',
    '../../sources/op-codes.fc',
    '../../sources/params.fc',
    '../../sources/nft-single.fc',
]);
exports.NftSingleCodeBoc = 'te6cckECFQEAAwoAART/APSkE/S88sgLAQIBYgcCAgEgBAMAI7x+f4ARgYuGRlgOS/uAFoICHAIBWAYFABG0Dp4AQgRr4HAAHbXa/gBNhjoaYfph/0gGEAICzgsIAgEgCgkAGzIUATPFljPFszMye1UgABU7UTQ+kD6QNTUMIAIBIA0MABE+kQwcLry4U2AEuQyIccAkl8D4NDTAwFxsJJfA+D6QPpAMfoAMXHXIfoAMfoAMPACBtMf0z+CEF/MPRRSMLqOhzIQRxA2QBXgghAvyyaiUjC64wKCEGk9OVBSMLrjAoIQHARBKlIwuoBMSEQ4BXI6HMhBHEDZAFeAxMjQ1NYIQGgudURK6n1ETxwXy4ZoB1NQwECPwA+BfBIQP8vAPAfZRNscF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY4+ghBRGkRjyFAKzxZQC88WcSRKFFRGsHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEFeUECo4W+IQAIICjjUm8AGCENUydtsQN0UAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwMzTiVQLwAwBUFl8GMwHQEoIQqMsArXCAEMjLBVAFzxYk+gIUy2oTyx/LPwHPFsmAQPsAAIYWXwZsInDIywHJcIIQi3cXNSHIy/8D0BPPFhOAQHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAfZRN8cF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIMIA8uGSIY4+ghAFE42RyFALzxZQC88WcSRLFFRGwHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEGeUECo5W+IUAIICjjUm8AGCENUydtsQN0YAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwNDTiVQLwA+GNLv4=';
exports.NftSingleCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftSingleCodeBoc, 'base64'))[0];
//# sourceMappingURL=NftSingle.js.map