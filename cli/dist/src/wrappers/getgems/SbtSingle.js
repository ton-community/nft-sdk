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
exports.SbtSingleCodeCell = exports.SbtSingleCodeBoC = exports.SbtSingleSource = exports.buildSingleSbtDataCell = exports.SbtSingle = void 0;
const ton_core_1 = require("ton-core");
const OffchainContent_1 = require("../../types/OffchainContent");
const combineFunc_1 = require("../../utils/combineFunc");
class SbtSingle {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address) {
        return new SbtSingle(address);
    }
    static createFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = buildSingleSbtDataCell(config);
            let address = (0, ton_core_1.contractAddress)(0, {
                code: exports.SbtSingleCodeCell,
                data: data
            });
            return new SbtSingle(address, 0, {
                code: exports.SbtSingleCodeCell,
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
    sendProveOwnership(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x04ded148, 32)
                    .storeUint(params.queryId, 64)
                    .storeAddress(params.dest)
                    .storeMaybeRef(params.forwardPayload)
                    .storeBit(params.withContent)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendRequestOwner(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0xd0c3bfea, 32)
                    .storeUint(params.queryId, 64)
                    .storeAddress(params.dest)
                    .storeMaybeRef(params.forwardPayload)
                    .storeBit(params.withContent)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendRevoke(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x6f89f5e3, 32)
                    .storeUint(params.queryId, 64)
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
    getAuthorityAddress(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_authority_address', []);
            return {
                authorityAddress: stack.readAddressOpt(),
            };
        });
    }
    getRevokedTime(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('get_revoked_time', []);
            return {
                revoked_time: stack.readBigNumber(),
            };
        });
    }
}
exports.SbtSingle = SbtSingle;
function buildSingleSbtDataCell(data) {
    let dataCell = (0, ton_core_1.beginCell)();
    let contentCell = (0, OffchainContent_1.encodeOffChainContent)(data.content);
    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeAddress(data.editorAddress);
    dataCell.storeRef(contentCell);
    dataCell.storeAddress(data.authorityAddress);
    dataCell.storeUint(data.revokedAt ? data.revokedAt : 0, 64);
    return dataCell.endCell();
}
exports.buildSingleSbtDataCell = buildSingleSbtDataCell;
// Data
exports.SbtSingleSource = (0, combineFunc_1.combineFunc)(__dirname, [
    '../../sources/stdlib.fc',
    '../../sources/op-codes.fc',
    '../../sources/params.fc',
    '../../sources/sbt-single.fc',
]);
exports.SbtSingleCodeBoC = 'te6ccgECGQEABBgAART/APSkE/S88sgLAQIBYgIDAgLOBAUCASATFAIBIAYHAgEgERIB7QyIccAkl8D4NDTA/pA+kAx+gAxcdch+gAx+gAw8AID0x8DcbCOTBAkXwTTH4IQBSTHrhK6jjnTPzCAEPhCcIIQwY6G0lUDbYBAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wCRMOLgAtM/gCAARPpEMHC68uFNgBPyCEC/LJqJSQLqOQDBsIjJwyMv/iwLPFoAQcIIQi3cXNUBVA4BAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wDgghDQw7/qUkC64wKCEATe0UhSQLrjAoIQHARBKlJAuo6FM0AD2zzgNDSCEBoLnVFSILoJCgsMAMBsM/pA1NMAMPhFcMjL/1AGzxb4Qs8WEswUyz9SMMsAA8MAlvhDUAPMAt6AEHixcIIQDdYH40A1FIBAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wAAyGwz+EJQA8cF8uGRAfpA1NMAMPhFcMjL//hCzxYTzBLLP1IQywABwwCU+EMBzN6AEHixcIIQBSTHrkBVA4BAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wAB9PhBFMcF8uGR+kAh8AH6QNIAMfoAggr68IAXoSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY49yPhBzxZQB88WgBCCEFEaRGMTcSZUSFADyMsfEss/IW6zkwHPF5Ex4slxBcjLBVAEzxZY+gITy2rMyQH7AJI2MOIDDQP+jhAxMvhBEscF8uGa1DD4Y/AD4DKCEB8EU3pSELqORzD4QiHHBfLhkYAQcIIQ1TJ220EEbYMGA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wCLAvhiiwL4ZPAD4IIQb4n141IQuuMCghDRNtOzUhC64wJsIQ4PEACAjjYi8AGAEIIQ1TJ22xRFA21xA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wCSbDHi+GHwAwAuMDH4RAHHBfLhkfhFwADy4ZP4I/hl8AMAijD4QiHHBfLhkYIK+vCAcPsCgBBwghDVMnbbQQRtgwYDyMsfEss/IW6zkwHPF5Ex4slxBcjLBVAEzxZY+gITy2rMyQH7AAAgghBfzD0UupPywZ3ehA/y8AA3O1E0PpAAfhi+kAB+GHUAfhj+kAB+GTTPzD4ZYAAvPhF+EPI+ELPFvhBzxbM+ETPFss/ye1UgAgFYFRYAGbx+f4AT+4RYF8IXwhwADbVjHgBfCJACASAXGAANsB08AL4QYAANs2D8AL4RYA==';
exports.SbtSingleCodeCell = ton_core_1.Cell.fromBoc(Buffer.from(exports.SbtSingleCodeBoC, 'base64'))[0];
//# sourceMappingURL=SbtSingle.js.map