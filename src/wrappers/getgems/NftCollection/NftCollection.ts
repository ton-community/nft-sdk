import { Address, beginCell, Cell, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'
import { encodeOffChainContent } from '../../../types/Content'
import { NftCollectionRoyalty } from '../../standard/NftCollectionRoyalty'

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

export const OperationCodes = {
    Mint: 1,
    BatchMint: 2,
    ChangeOwner: 3,
    EditContent: 4,
    GetRoyaltyParams: 0x693d3950,
    GetRoyaltyParamsResponse: 0xa8cb00ad
}

export class NftCollection extends NftCollectionRoyalty {
    static code = Cell.fromBoc(Buffer.from('te6cckECFAEAAh8AART/APSkE/S88sgLAQIBYgkCAgEgBAMAJbyC32omh9IGmf6mpqGC3oahgsQCASAIBQIBIAcGAC209H2omh9IGmf6mpqGAovgngCOAD4AsAAvtdr9qJofSBpn+pqahg2IOhph+mH/SAYQAEO4tdMe1E0PpA0z/U1NQwECRfBNDUMdQw0HHIywcBzxbMyYAgLNDwoCASAMCwA9Ra8ARwIfAFd4AYyMsFWM8WUAT6AhPLaxLMzMlx+wCAIBIA4NABs+QB0yMsCEsoHy//J0IAAtAHIyz/4KM8WyXAgyMsBE/QA9ADLAMmAE59EGOASK3wAOhpgYC42Eit8H0gGADpj+mf9qJofSBpn+pqahhBCDSenKgpQF1HFBuvgoDoQQhUZYBWuEAIZGWCqALnixJ9AQpltQnlj+WfgOeLZMAgfYBwGyi544L5cMiS4ADxgRLgAXGBEuAB8YEYGYHgAkExIREAA8jhXU1DAQNEEwyFAFzxYTyz/MzMzJ7VTgXwSED/LwACwyNAH6QDBBRMhQBc8WE8s/zMzMye1UAKY1cAPUMI43gED0lm+lII4pBqQggQD6vpPywY/egQGTIaBTJbvy9AL6ANQwIlRLMPAGI7qTAqQC3gSSbCHis+YwMlBEQxPIUAXPFhPLP8zMzMntVABgNQLTP1MTu/LhklMTugH6ANQwKBA0WfAGjhIBpENDyFAFzxYTyz/MzMzJ7VSSXwXiN0CayQ==', 'base64'))[0]

    static buildDataCell(data: NftCollectionData) {
        const dataCell= beginCell()

        dataCell.storeAddress(data.ownerAddress)
        dataCell.storeUint(data.nextItemIndex, 64)

        const contentCell = beginCell()

        const collectionContent = encodeOffChainContent(data.collectionContent)

        const commonContent = beginCell()
        commonContent.storeBuffer(Buffer.from(data.commonContent))
        // commonContent.bits.writeString(data.commonContent)

        contentCell.storeRef(collectionContent)
        contentCell.storeRef(commonContent)
        dataCell.storeRef(contentCell)

        dataCell.storeRef(data.nftItemCode)

        const royaltyCell = beginCell()
        royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16)
        royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16)
        royaltyCell.storeAddress(data.royaltyParams.royaltyAddress)
        dataCell.storeRef(royaltyCell)

        return dataCell.endCell()
    }

    static createFromAddress(
        address: Address
    ) {
        return new NftCollection(
            address
        )
    }

    static async createFromConfig(
        config: NftCollectionData,
        workchain = 0
    ) {

        const data = this.buildDataCell(config)
        const address = contractAddress(
            workchain,
            {
                code: this.code,
                data: data
            }
        )

        return new NftCollection(
            address,
            {
                code: this.code,
                data: data
            }
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
            sendMode: SendMode.PAY_GAS_SEPARATLY,
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
            sendMode: SendMode.PAY_GAS_SEPARATLY
        })
    }
}

// Utils

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