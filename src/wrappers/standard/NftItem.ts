import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode } from 'ton-core'
import { encodeOffChainContent } from '../../types/OffchainContent'

export class NftItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static buildNftItemDataCell(data: NftItemData) {
        const dataCell= beginCell()
    
        const contentCell = encodeOffChainContent(data.content)
    
        dataCell.storeAddress(data.ownerAddress)
        dataCell.storeAddress(data.editorAddress)
        dataCell.storeRef(contentCell)
    
        return dataCell.endCell()
    }

    static createFromAddress(
        address: Address
    ) {
        return new NftItem(
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

    async sendTransfer(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
        newOwner: Address
        responseDestination: Address
        customPayload?: Cell
        forwardAmount: bigint
        forwardPayload?: Cell
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x5fcc3d14, 32)
                .storeUint(params.queryId, 64)
                .storeAddress(params.newOwner)
                .storeAddress(params.responseDestination)
                .storeMaybeRef(params.customPayload)
                .storeCoins(params.forwardAmount)
                .storeMaybeRef(params.forwardPayload)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    // Getter Functio

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

// Utils

export type NftItemData = {
    ownerAddress: Address
    editorAddress: Address
    content: string
}