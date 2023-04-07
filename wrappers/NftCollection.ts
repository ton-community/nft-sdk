import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, Slice } from 'ton-core';

export class NftCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftCollection(address);
    }

    // const { stack } = await provider.get('get_nft_address_by_index', [
    //     { type: 'int', value: index }
    // ])

    async getCollectionData(
        provider: ContractProvider, 
        next_item_index: bigint, 
        collection_content: Cell,
        owner_address: Slice
    ) {
        const { stack } = await provider.get('get_collection_data', [
            { type: 'int', value: next_item_index },
            { type: 'cell', cell: collection_content },
            { type: 'slice', cell: owner_address.asCell() }
        ])
        return {
            next_item_index: stack.readBigNumber(),
            collection_content: stack.readCellOpt(),
            owner_address: stack.readAddressOpt(),
        }
    }

    async getNftAddressByIndex(
        provider: ContractProvider,
        index: bigint
    ) {
        const { stack } = await provider.get('get_nft_address_by_index', [
            { type: 'int', value: index }
        ])
        return {
            nft_address: stack.readAddressOpt(),
        }
    }

    async getNftContent(
        provider: ContractProvider,
        index: bigint,
        individual_content: Cell
    ) {
        const { stack } = await provider.get('get_nft_content', [
            { type: 'int', value: index },
            { type: 'cell', cell: individual_content }
        ])
        return {
            full_content: stack.readCellOpt(),
        }
    }
    
}
