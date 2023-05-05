import { Address, beginCell, Cell, ContractProvider, Sender, SendMode } from 'ton-core'
import { NftCollection } from '../standard/NftCollection'

export type CollectionMintItemInput = {
    passAmount: bigint
    index: number
    ownerAddress: Address
    content: string
}

export type RoyaltyParams = {
    royaltyFactor: number
    royaltyBase: number
    royaltyAddress: Address
}

const OperationCodes = {
    Mint: 1,
    BatchMint: 2,
    ChangeOwner: 3,
    EditContent: 4,
    GetRoyaltyParams: 0x693d3950,
    GetRoyaltyParamsResponse: 0xa8cb00ad
}

export class NftCollectionEditable implements NftCollection {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(
        address: Address
    ) {
        return new NftCollectionEditable(
            address
        )
    }

    // Deployment
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            body: beginCell().endCell(),
        })
    }


    async sendMint(provider: ContractProvider, via: Sender, params: { 
        queryId?: number, 
        value: bigint,
        passAmount: bigint, 
        itemIndex: number, 
        itemOwnerAddress: Address, 
        itemContent: string 
    }) {
        const itemContent = beginCell()
        // itemContent.bits.writeString(params.itemContent)
        itemContent.storeBuffer(Buffer.from(params.itemContent)).endCell()

        const nftItemMessage = beginCell()

        nftItemMessage.storeAddress(params.itemOwnerAddress)
        nftItemMessage.storeRef(itemContent).endCell()

        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(params.queryId || 0, 64)
                .storeUint(params.itemIndex, 64)
                .storeCoins(params.passAmount)
                .storeRef(nftItemMessage)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendChangeOwner(provider: ContractProvider, via: Sender, params: { 
        queryId?: number, 
        value: bigint,
        newOwner: Address
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.ChangeOwner, 32)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.newOwner)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY
        })
    }

    async sendRoyaltyParams(provider: ContractProvider, via: Sender, params: { 
        queryId?: number, 
        value: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.GetRoyaltyParams, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY
        })
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

    async getRoyaltyParams(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('royalty_params', [])
        return {
            numerator: stack.readBigNumber(),
            denominator: stack.readBigNumber(),
            destination: stack.readAddressOpt()
        }
    }
}
