import { Address, beginCell, Cell, Contract, ContractProvider, Sender } from 'ton-core'
import { encodeOffChainContent } from '../../types/OffchainContent'

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

// Utils

export type RoyaltyParams = {
    royaltyFactor: number
    royaltyBase: number
    royaltyAddress: Address
}

export type NftCollectionData = {
    ownerAddress: Address,
    nextItemIndex: number | bigint
    collectionContent: string
    commonContent: string
    nftItemCode: Cell
    royaltyParams: RoyaltyParams
}

// default#_ royalty_factor:uint16 royalty_base:uint16 royalty_address:MsgAddress = RoyaltyParams;
// storage#_ owner_address:MsgAddress next_item_index:uint64
//           ^[collection_content:^Cell common_content:^Cell]
//           nft_item_code:^Cell
//           royalty_params:^RoyaltyParams
//           = Storage;