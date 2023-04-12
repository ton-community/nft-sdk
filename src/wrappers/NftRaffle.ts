import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, Slice } from 'ton-core';

export class NftFixedPriceV3 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftFixedPriceV3(address);
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

    async sendCoins(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }


    // deploySigned
}
