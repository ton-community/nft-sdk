import { Address, Cell, Contract, ContractProvider } from 'ton-core'

export class NftCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(
        address: Address
    ) {
        return new NftCollection(
            address
        )
    }

    async getCollectionData(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('get_collection_data', [])
        return {
            nextItemIndex: stack.readBigNumber(),
            collectionContent: stack.readCellOpt(),
            ownerAddress: stack.readAddressOpt(),
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
            nftAddress: stack.readAddressOpt(),
        }
    }

    async getNftContent(
        provider: ContractProvider,
        index: bigint,
        individualContent: Cell
    ) {
        const { stack } = await provider.get('get_nft_content', [
            { type: 'int', value: index },
            { type: 'cell', cell: individualContent }
        ])
        return {
            fullContent: stack.readCellOpt(),
        }
    }

}