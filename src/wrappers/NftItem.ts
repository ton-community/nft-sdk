import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode } from 'ton-core';

export class NftItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftItem(address);
    }

    async sendTrans 

    // const { stack } = await provider.get('get_nft_address_by_index', [
    //     { type: 'int', value: index }
    // ])

    async getNftData(provider: ContractProvider) {
        const { stack } = await provider.get('get_nft_data', [])
        return {
            init: stack.readBoolean(),
            index: stack.readBigNumber(),
            collectionAddress: stack.readAddressOpt(),
            ownerAddress: stack.readAddressOpt(),
            individualContent: stack.readCellOpt(),
        }
    }
}
