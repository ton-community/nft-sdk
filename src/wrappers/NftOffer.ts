import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode } from 'ton-core';

export class NftItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftItem(address);
    }

    async sendCancelOffer(provider: ContractProvider, via: Sender, params: { 
        message?: string,
        value: bigint
    }) {
        const nextPayload = beginCell()

        if (params.message) {
            nextPayload.storeUint(0, 32)
            const m = Buffer.from(params.message.substring(0, 121), 'utf-8')
            nextPayload.storeBuffer(m.slice(0, 121))
        }

        nextPayload.endCell();

        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0,32)
                .storeBuffer(Buffer.from('cancel'))
                .storeRef(nextPayload)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendCancelOfferByMarketplace(provider: ContractProvider, via: Sender, params: { 
        amount: bigint; 
        message?: string 
        value: bigint
    }) {
        const nextPayload = beginCell()

        if (params.message) {
            nextPayload.storeUint(0, 32)
            const m = Buffer.from(params.message.substring(0, 121), 'utf-8')
            nextPayload.storeBuffer(m.slice(0, 121))
        }

        nextPayload.endCell();

        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(3,32)
                .storeCoins(params.amount)
                .storeRef(nextPayload)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async getOfferData(provider: ContractProvider) {
        const { stack } = await provider.get('get_offer_data', [])

        return {
            offerType: stack.readBigNumber(),
            isComplete: stack.readBoolean(),
            createdAt: stack.readBigNumber(),
            finishAt: stack.readBigNumber(),
            marketplaceAddress: stack.readAddress(),
            nftAddress: stack.readAddress(),
            offerOwnerAddress: stack.readAddress(),
            fullPrice: stack.readBigNumber(),
            marketplaceFeeAddress: stack.readAddress(),
            marketplaceFactor: stack.readBigNumber(),
            marketplaceBase: stack.readBigNumber(),
            royaltyAddress: stack.readAddress(),
            royaltyFactor: stack.readBigNumber(),
            royaltyBase: stack.readBigNumber(),
            profitPrice: stack.readBigNumber(),
          }
    }
}
