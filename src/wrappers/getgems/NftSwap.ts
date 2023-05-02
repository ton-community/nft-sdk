import { Address, Dictionary, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core';

const OperationCodes = {
    ownershipAssigned: 0x05138d91,
    addCoins: 1,
    cancel: 2,
    maintain: 3,
    topup: 4,
    transferCommission: 0x82bd8f2a,
    transferCancel: 0xb5188860,
    transferComplete: 0xef03d009,
}

export class NftSwap implements Contract {
    constructor(readonly address: Address, readonly workchain: number, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(
        address: Address,
        workchain: number,
        init: { 
            code: Cell; 
            data: Cell 
        }
    ) {
        return new NftSwap(
            address,
            workchain,
            init
            );
    }

    // Deployment
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            body: beginCell().endCell(),
        })
    }


    async sendOwnershipAssigned(provider: ContractProvider, via: Sender, params: { 
        value: bigint, 
        queryId?: number,
        prevOwner: Address
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.ownershipAssigned, 32)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.prevOwner)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendCancel(provider: ContractProvider, via: Sender, params: { 
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.cancel, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendAddCoins(provider: ContractProvider, via: Sender, params: { 
        value: bigint,
        queryId?: number,
        coins: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.addCoins, 32)
                .storeUint(params.queryId || 0, 64)
                .storeCoins(params.coins)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendTransferCommission(provider: ContractProvider, via: Sender, params: {
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.transferCommission, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendTransferCancel(provider: ContractProvider, via: Sender, params: {
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.transferCancel, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendTransferComplete(provider: ContractProvider, via: Sender, params: {
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.transferComplete, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendMaintain(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint,
            queryId?: number,
            mode: number,
            msg: Cell
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.maintain, 32)
                .storeUint(params.queryId || 0, 64)
                .storeUint(params.mode, 8)
                .storeRef(params.msg)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendTopup(provider: ContractProvider, via: Sender, params: { 
        value: bigint,
        queryId?: number 
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.topup, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }
    
    async sendMakeMessage(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint,
            queryId?: number,
            to: Address,
            amount: bigint,
            body: Cell
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x18, 6)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.to)
                .storeCoins(params.amount)
                .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 +1)
                .storeRef(params.body)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async getRaffleState(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('raffle_state', [])
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
        }
    }
}

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

