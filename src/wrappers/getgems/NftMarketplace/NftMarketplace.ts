import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'
import { KeyPair, sign } from 'ton-crypto'

/**
 * Class representing a NFT Marketplace contract.
 */
export class NftMarketplace implements Contract {
    /**
     * Constructs an instance of the NftMarketplace contract.
     * @param address - The address of the contract.
     * @param init - The initial code and data for the contract.
     */
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    /**
     * Creates an NftMarketplace instance from an address.
     * @param address - The address to create from.
     * @returns A new NftMarketplace instance.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftMarketplace(
            address
        )
    }

    static code = Cell.fromBoc(Buffer.from('te6cckEBDAEA7wABFP8A9KQT9LzyyAsBAgEgAwIAePKDCNcYINMf0x/THwL4I7vyY/ABUTK68qFRRLryogT5AVQQVfkQ8qP4AJMg10qW0wfUAvsA6DABpALwAgIBSAcEAgFIBgUAEbjJftRNDXCx+AAXuznO1E0NM/MdcL/4AgLOCQgAF0AsjLH8sfy//J7VSAIBIAsKABU7UTQ0x/TH9P/MIACpGwiIMcAkVvgAdDTAzBxsJEw4PABbCEB0x8BwAGONIMI1xgg+QFAA/kQ8qPU1DAh+QBwyMoHy//J0Hd0gBjIywXLAljPFnD6AstrEszMyYBA+wDgW4NC26jQ=', 'base64'))[0]

    /**
     * Builds the data cell for an NFT marketplace.
     * @param data - The data for the NFT marketplace.
     * @returns A cell containing the data for the NFT marketplace.
     */
    static buildDataCell(data: NftMarketplaceData) {
        const dataCell= beginCell()

        dataCell.storeUint(data.seqno, 32)
        dataCell.storeUint(data.subwallet, 32)
        dataCell.storeBuffer(data.publicKey)

        return dataCell.endCell()
    }

    /**
     * Creates an NftMarketplace instance from a configuration object.
     * @param config - The configuration data for the NFT marketplace.
     * @param workchain - The workchain ID (default is 0).
     * @returns A new NftMarketplace instance.
     */
    static async createFromConfig(
        config: NftMarketplaceData,
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

        return new NftMarketplace(
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
     * Sends coins to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the coins.
     * @param params - Parameters for the operation, including the value and queryId.
     */
    async sendCoins(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }
}

/**
 * Type definition for the data of an NFT marketplace.
 */
export type NftMarketplaceData = {
    seqno: number
    subwallet: number
    publicKey: Buffer
}

/**
 * Builds a signature for an operation.
 * @param params - Parameters for the signature, including the key pair, sale state initialization, and sale message body.
 * @returns The generated signature.
 */
export function buildSignature(params: { 
    keyPair: KeyPair, 
    saleStateInit: Cell, 
    saleMessageBody: Cell 
}) {
    const bodyCell = beginCell()
    bodyCell.storeRef(params.saleStateInit)
    bodyCell.storeRef(params.saleMessageBody)

    return sign(bodyCell.endCell().hash(), params.keyPair.secretKey)
}