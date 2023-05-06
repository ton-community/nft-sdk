import { Address, beginCell, Cell, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'
import { NftItem as NftItemStandard } from '../standard/NftItem'

export class NftItem implements NftItemStandard {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static code = Cell.fromBoc(Buffer.from('te6cckECDQEAAdAAART/APSkE/S88sgLAQIBYgMCAAmhH5/gBQICzgcEAgEgBgUAHQDyMs/WM8WAc8WzMntVIAA7O1E0NM/+kAg10nCAJp/AfpA1DAQJBAj4DBwWW1tgAgEgCQgAET6RDBwuvLhTYALXDIhxwCSXwPg0NMDAXGwkl8D4PpA+kAx+gAxcdch+gAx+gAw8AIEs44UMGwiNFIyxwXy4ZUB+kDUMBAj8APgBtMf0z+CEF/MPRRSMLqOhzIQN14yQBPgMDQ0NTWCEC/LJqISuuMCXwSED/LwgCwoAcnCCEIt3FzUFyMv/UATPFhAkgEBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AAH2UTXHBfLhkfpAIfAB+kDSADH6AIIK+vCAG6EhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGOPoIQBRONkchQCc8WUAvPFnEkSRRURqBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7ABBHlBAqN1viDACCAo41JvABghDVMnbbEDdEAG1xcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wCTMDI04lUC8ANqhGIu', 'base64'))[0]

    static buildDataCell(data: NftItemData) {
        const dataCell= beginCell()
    
        const contentCell = beginCell()
        // contentCell.bits.writeString(data.content)
        contentCell.storeBuffer(Buffer.from(data.content))
    
        dataCell.storeUint(data.index, 64)
        dataCell.storeAddress(data.collectionAddress)
        dataCell.storeAddress(data.ownerAddress)
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


    static async createFromConfig(
        config: NftItemData,
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

        return new NftItem(
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

    async sendGetStaticData(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint
            queryId: bigint
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x2fcb26a2, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendGetRoyaltyParams(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint
            queryId: bigint
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x693d3950, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendTransferEditorship(provider: ContractProvider, via: Sender, params: { 
        value: bigint, 
        queryId?: number,
        newEditor: Address, 
        responseTo: Address|null,
        forwardAmount?: bigint 
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x1c04412a, 32)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.newEditor)
                .storeAddress(params.responseTo)
                .storeBit(false)
                .storeCoins(params.forwardAmount || 0)
                .storeBit(false)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

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
    index: number
    collectionAddress: Address | null
    ownerAddress: Address
    content: string
}