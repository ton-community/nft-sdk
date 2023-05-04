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
exports.NftItemCodeCell = exports.NftItemCodeBoc = exports.NftItemSource = exports.buildNftItemDataCell = exports.NftItem = void 0;
const ton_core_1 = require("ton-core");
const combineFunc_1 = require("../../utils/combineFunc");
const OffchainContent_1 = require("../../types/OffchainContent");
class NftItem {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromConfig(config, workchain = 0) {
        const data = buildNftItemDataCell(config);
        const init = {
            code: exports.NftItemCodeCell,
            data: data
        };
        return new NftItem((0, ton_core_1.contractAddress)(workchain, init), workchain, init);
    }
    static createFromAddress(address) {
        return new NftItem(address);
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
    // Getter Functio
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
    let contentCell = (0, OffchainContent_1.encodeOffChainContent)(data.content);
    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeAddress(data.editorAddress);
    dataCell.storeRef(contentCell);
    return dataCell.endCell();
}
exports.buildNftItemDataCell = buildNftItemDataCell;
exports.NftItemSource = (0, combineFunc_1.combineFunc)(__dirname, [
    '../../sources/stdlib.fc',
    '../../sources/op-codes.fc',
    '../../sources/params.fc',
    '../../sources/nft-single.fc',
]);
exports.NftItemCodeBoc = 'te6ccgECFQEAAw4AART/APSkE/S88sgLAQIBYgIDAgLOBAUCASAREgIBIAYHAgEgDxAEvQyIccAkl8D4NDTAwFxsJJfA+D6QPpAMfoAMXHXIfoAMfoAMPACBtMf0z+CEF/MPRRSMLqOiTIQRxA2QBXbPOCCEC/LJqJSMLrjAoIQaT05UFIwuuMCghAcBEEqUjC6gCAkKCwARPpEMHC68uFNgAfZRN8cF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIMIA8uGSIY4+ghAFE42RyFALzxZQC88WcSRLFFRGwHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEGeUECo5W+IMAIYWXwZsInDIywHJcIIQi3cXNSHIy/8D0BPPFhOAQHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAFQWXwYzAdASghCoywCtcIAQyMsFUAXPFiT6AhTLahPLH8s/Ac8WyYBA+wABYI6JMhBHEDZAFds84DEyNDU1ghAaC51RErqfURPHBfLhmgHU1DAQI/AD4F8EhA/y8A0AggKONSbwAYIQ1TJ22xA3RgBtcXCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAkzA0NOJVAvADAfZRNscF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY4+ghBRGkRjyFAKzxZQC88WcSRKFFRGsHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEFeUECo4W+IOAIICjjUm8AGCENUydtsQN0UAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwMzTiVQLwAwAVO1E0PpA+kDU1DCAAGzIUATPFljPFszMye1UgAgFYExQAI7x+f4ARgYuGRlgOS/uAFoICHAAdtdr+AE2GOhph+mH/SAYQABG0Dp4AQgRr4HA=';
exports.NftItemCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.NftItemCodeBoc, 'base64'))[0];
//# sourceMappingURL=NftItem.js.map