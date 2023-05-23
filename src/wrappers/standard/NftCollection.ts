import { Address, Cell, Contract, ContractProvider } from 'ton-core'

/**
 * Represents a collection of NFT items.
 */
export class NftCollection implements Contract {

    /**
     * Constructs an instance of the NftCollection contract.
     * @param address - The address of the contract.
     * @param init - Optional initialization data for the contract's code and data.
     */
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    /**
     * Constructs an instance of the NftCollection contract from an address.
     * @param address - The address of the contract.
     * @returns An instance of NftCollection.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftCollection(
            address
        )
    }

    /**
     * Retrieves the collection data from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @returns An object with the collection data.
     */
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

    /**
     * Retrieves the NFT address by index from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @param index - The index of the NFT in the collection.
     * @returns An object with the NFT address.
     */
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

    /**
     * Retrieves the NFT content from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @param index - The index of the NFT in the collection.
     * @param individualContent - The individual content of the NFT.
     * @returns An object with the full NFT content.
     */
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