import { Address, beginCell, Cell, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'
import { NftItemRoyalty } from '../../standard/NftItemRoyalty'

/**
* Class representing a Non-Fungible Token (NFT) Item.
* This class extends the NftItemRoyalty class.
*/
export class NftItem extends NftItemRoyalty {
    static code = Cell.fromBoc(Buffer.from('te6cckECDQEAAdAAART/APSkE/S88sgLAQIBYgMCAAmhH5/gBQICzgcEAgEgBgUAHQDyMs/WM8WAc8WzMntVIAA7O1E0NM/+kAg10nCAJp/AfpA1DAQJBAj4DBwWW1tgAgEgCQgAET6RDBwuvLhTYALXDIhxwCSXwPg0NMDAXGwkl8D4PpA+kAx+gAxcdch+gAx+gAw8AIEs44UMGwiNFIyxwXy4ZUB+kDUMBAj8APgBtMf0z+CEF/MPRRSMLqOhzIQN14yQBPgMDQ0NTWCEC/LJqISuuMCXwSED/LwgCwoAcnCCEIt3FzUFyMv/UATPFhAkgEBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AAH2UTXHBfLhkfpAIfAB+kDSADH6AIIK+vCAG6EhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGOPoIQBRONkchQCc8WUAvPFnEkSRRURqBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7ABBHlBAqN1viDACCAo41JvABghDVMnbbEDdEAG1xcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wCTMDI04lUC8ANqhGIu', 'base64'))[0]

    /**
     * Builds the data cell for an NFT item.
     * @param data - The data for the NFT item.
     * @returns A cell containing the data for the NFT item.
     */
    static buildDataCell(data: NftItemData) {
        const dataCell = beginCell()
    
        const contentCell = beginCell()
        // contentCell.bits.writeString(data.content)
        contentCell.storeBuffer(Buffer.from(data.content))
    
        dataCell.storeUint(data.index, 64)
        dataCell.storeAddress(data.collectionAddress)
        dataCell.storeAddress(data.ownerAddress)
        dataCell.storeRef(contentCell)
    
        return dataCell.endCell()
    }

    /**
     * Creates an NftItem instance from an address.
     * @param address - The address to create from.
     * @returns A new NftItem instance.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftItem(
            address
        )
    }

    /**
     * Creates an NftItem instance from a configuration object.
     * @param config - The configuration data for the NFT item.
     * @param workchain - The workchain ID (default is 0).
     * @returns A new NftItem instance.
     */
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

    /**
     * Sends a deploy command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the deploy command.
     * @param value - The value to send with the command.
     */
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            body: beginCell().endCell(),
        })
    }

    /**
     * Sends a command to transfer editorship of the NFT item.
     * @param provider - The contract provider.
     * @param via - The sender of the command.
     * @param params - Parameters for the operation, including the value, queryId, new editor address, response address, and forward amount.
     */
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
}

/**
 * Type definition for the data of an NFT item.
 */
export type NftItemData = {
    index: number
    collectionAddress: Address | null
    ownerAddress: Address
    content: string
}