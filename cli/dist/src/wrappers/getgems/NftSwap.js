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
exports.NftSwap = void 0;
const ton_core_1 = require("ton-core");
const OperationCodes = {
    ownershipAssigned: 0x05138d91,
    addCoins: 1,
    cancel: 2,
    maintain: 3,
    topup: 4,
    transferCommission: 0x82bd8f2a,
    transferCancel: 0xb5188860,
    transferComplete: 0xef03d009,
};
class NftSwap {
    constructor(address, workchain, init) {
        this.address = address;
        this.workchain = workchain;
        this.init = init;
    }
    static createFromAddress(address, workchain, init) {
        return new NftSwap(address, workchain, init);
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
    sendOwnershipAssigned(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.ownershipAssigned, 32)
                    .storeUint(params.queryId || 0, 64)
                    .storeAddress(params.prevOwner)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendCancel(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.cancel, 32)
                    .storeUint(params.queryId || 0, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendAddCoins(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.addCoins, 32)
                    .storeUint(params.queryId || 0, 64)
                    .storeCoins(params.coins)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendTransferCommission(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.transferCommission, 32)
                    .storeUint(params.queryId || 0, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendTransferCancel(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.transferCancel, 32)
                    .storeUint(params.queryId || 0, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendTransferComplete(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.transferComplete, 32)
                    .storeUint(params.queryId || 0, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendMaintain(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.maintain, 32)
                    .storeUint(params.queryId || 0, 64)
                    .storeUint(params.mode, 8)
                    .storeRef(params.msg)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendTopup(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(OperationCodes.topup, 32)
                    .storeUint(params.queryId || 0, 64)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    sendMakeMessage(provider, via, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield provider.internal(via, {
                value: params.value,
                body: (0, ton_core_1.beginCell)()
                    .storeUint(0x18, 6)
                    .storeUint(params.queryId || 0, 64)
                    .storeAddress(params.to)
                    .storeCoins(params.amount)
                    .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
                    .storeRef(params.body)
                    .endCell(),
                sendMode: ton_core_1.SendMode.PAY_GAS_SEPARATELY,
            });
        });
    }
    getRaffleState(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { stack } = yield provider.get('raffle_state', []);
            return {
                state: stack.readBigNumber(),
                rightNftsCount: stack.readBigNumber(),
                rightNftsReceived: stack.readBigNumber(),
                leftNftsCount: stack.readBigNumber(),
                leftNftsReceived: stack.readBigNumber(),
                leftUser: stack.readAddressOpt(),
                rightUser: stack.readAddressOpt(),
                superUser: stack.readAddressOpt(),
                leftCommission: stack.readBigNumber(),
                rightCommission: stack.readBigNumber(),
                leftCoinsGot: stack.readBigNumber(),
                rightCoinsGot: stack.readBigNumber(),
                nftTransferFee: stack.readCell(),
                nfts: stack.readCell(),
                raffledNfts: stack.readCell()
            };
        });
    }
}
exports.NftSwap = NftSwap;
// Utils
// export const SwapState = {
//     Active: 1,
//     Cancelled: 2,
//     Completed: 3,
// }
// interface NFTItem {
//     addr: Address
//     sent: boolean
// }
// export type SwapData = {
//     state: number,
//     leftAddress: Address
//     rightAddress: Address
//     rightNft: NFTItem[]
//     leftNft: NFTItem[]
//     supervisorAddress: Address
//     commissionAddress: Address
//     leftCommission: bigint
//     leftAmount: bigint
//     leftCoinsGot: bigint
//     rightCommission: bigint
//     rightAmount: bigint
//     rightCoinsGot: bigint
// }
// export function buildSwapDataCell(data: SwapData) {
//     let dataCell = beginCell()
//     dataCell.storeUint(data.state, 2)
//     dataCell.storeAddress(data.leftAddress)
//     dataCell.storeAddress(data.rightAddress)
//     dataCell.storeCoins(data.leftCommission)
//     dataCell.storeCoins(data.leftAmount)
//     dataCell.storeCoins(data.leftCoinsGot)
//     dataCell.storeBit(data.leftNft.length > 0)
//     if (data.leftNft.length > 0) {
//         let leftNft = Dictionary.empty(256)
//         for (const leftNftKey in data.leftNft) {
//             let bitCell = beginCell();
//             bitCell.storeBit(data.leftNft[leftNftKey].sent);
//             leftNft.storeCell(data.leftNft[leftNftKey].addr.hash, bitCell)
//         }
//         dataCell.storeRef(leftNft.endCell())
//     }
//     dataCell.storeCoins(data.rightCommission)
//     dataCell.storeCoins(data.rightAmount)
//     dataCell.storeCoins(data.rightCoinsGot)
//     dataCell.storeBit(data.rightNft.length > 0)
//     if (data.rightNft.length > 0) {
//         let rightNft = new DictBuilder(256)
//         for (const rightNftKey in data.rightNft) {
//             let bitCell = beginCell();
//             bitCell.storeBit(data.rightNft[rightNftKey].sent);
//             rightNft.storeCell(data.rightNft[rightNftKey].addr.hash, bitCell)
//         }
//         dataCell.storeRef(rightNft.endCell())
//     }
//     let marketCell = beginCell()
//     marketCell.storeAddress(data.commissionAddress)
//     marketCell.storeAddress(data.supervisorAddress)
//     dataCell.storeRef(marketCell)
//     return dataCell
// }
// Data
//# sourceMappingURL=NftSwap.js.map