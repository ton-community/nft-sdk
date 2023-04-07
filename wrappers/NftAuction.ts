import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, Slice } from 'ton-core';

export class NftAuction implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftAuction(address);
    }

    async getSaleData(provider: ContractProvider) {
        const { stack } = await provider.get('get_sale_data', [])
        return {
            saleType: stack.readBigNumber(),
            end: stack.readBigNumber(),
            endTimestamp: stack.readBigNumber(),
            marketplaceAddress: stack.readAddressOpt(),
            nftAddress: stack.readAddressOpt(),
            nftOwnerAddress: stack.readAddressOpt(),
            lastBidAmount: stack.readBigNumber(),
            lastBidAddress: stack.readAddressOpt(),
            minStep: stack.readBigNumber(),
            marketplaceFeeAddress: stack.readAddressOpt(),
            marketplaceFeeFactor: stack.readBigNumber(), 
            marketplaceFeeBase: stack.readBigNumber(),
            royaltyAddress: stack.readAddressOpt(),
            royaltyFactor: stack.readBigNumber(), 
            royaltyBase: stack.readBigNumber(),
            maxBid: stack.readBigNumber(),
            minBid: stack.readBigNumber(),
            createdAt: stack.readBigNumber(),
            lastBidAt: stack.readBigNumber(),
            isCanceled: stack.readBigNumber(),
        }
    }
}
