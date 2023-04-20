import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, Slice } from 'ton-core';

export const OperationCodes = {
    ownershipAssigned: 0x05138d91,
    cancel: 2001,
    addCoins: 2002,
    // maintain: 2003,
    // sendAgain: 2004,
}

export class NftRaffle implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftRaffle(address);
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
        value: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.cancel, 32)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendAddCoins(provider: ContractProvider, via: Sender, params: { 
        value: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.addCoins, 32)
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
