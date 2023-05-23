import { Address, beginCell, Cell, ContractProvider, Transaction, Sender, SendMode, contractAddress, ExternalAddress } from 'ton-core'
import { storeOffchainContent } from '../../../types/Content'
import { NftCollectionRoyalty } from '../../standard/NftCollectionRoyalty'
import { isEligibleTransaction } from '../../../utils/EligibleInternalTx'
import { Maybe } from 'ton-core/dist/utils/maybe'

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

/**
 * Class representing a Non-Fungible Token (NFT) collection contract.
 * This class extends from the `NftCollectionRoyalty` class.
 */
export class NftCollection extends NftCollectionRoyalty {
    static code = Cell.fromBoc(Buffer.from('te6cckECFAEAAh8AART/APSkE/S88sgLAQIBYgkCAgEgBAMAJbyC32omh9IGmf6mpqGC3oahgsQCASAIBQIBIAcGAC209H2omh9IGmf6mpqGAovgngCOAD4AsAAvtdr9qJofSBpn+pqahg2IOhph+mH/SAYQAEO4tdMe1E0PpA0z/U1NQwECRfBNDUMdQw0HHIywcBzxbMyYAgLNDwoCASAMCwA9Ra8ARwIfAFd4AYyMsFWM8WUAT6AhPLaxLMzMlx+wCAIBIA4NABs+QB0yMsCEsoHy//J0IAAtAHIyz/4KM8WyXAgyMsBE/QA9ADLAMmAE59EGOASK3wAOhpgYC42Eit8H0gGADpj+mf9qJofSBpn+pqahhBCDSenKgpQF1HFBuvgoDoQQhUZYBWuEAIZGWCqALnixJ9AQpltQnlj+WfgOeLZMAgfYBwGyi544L5cMiS4ADxgRLgAXGBEuAB8YEYGYHgAkExIREAA8jhXU1DAQNEEwyFAFzxYTyz/MzMzJ7VTgXwSED/LwACwyNAH6QDBBRMhQBc8WE8s/zMzMye1UAKY1cAPUMI43gED0lm+lII4pBqQggQD6vpPywY/egQGTIaBTJbvy9AL6ANQwIlRLMPAGI7qTAqQC3gSSbCHis+YwMlBEQxPIUAXPFhPLP8zMzMntVABgNQLTP1MTu/LhklMTugH6ANQwKBA0WfAGjhIBpENDyFAFzxYTyz/MzMzJ7VSSXwXiN0CayQ==', 'base64'))[0]

    /**
     * Builds the data cell for an NFT collection.
     * @param data - The data for the NFT collection.
     * @returns A cell containing the data for the NFT collection.
     */
    static buildDataCell(data: NftCollectionData) {
        const dataCell = beginCell()

        dataCell.storeAddress(data.ownerAddress)
        dataCell.storeUint(data.nextItemIndex, 64)

        const contentCell = beginCell()

        const collectionContent = storeOffchainContent({
            type: 'offchain',
            uri: data.collectionContent
        })

        const commonContent = beginCell()
        commonContent.storeBuffer(Buffer.from(data.commonContent))

        contentCell.store(collectionContent)
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

    /**
     * Creates an `NftCollection` instance from an address.
     * @param address - The address to create from.
     * @returns A new `NftCollection` instance.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftCollection(
            address
        )
    }

    /**
     * Creates an `NftCollection` instance from a configuration object.
     * @param config - The configuration data for the NFT collection.
     * @param workchain - The workchain ID (default is 0).
     * @returns A new `NftCollection` instance.
     */
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
     * Sends a mint command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the mint command.
     * @param params - The parameters for the mint command.
     */
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

    /**
     * Sends a change owner command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the change owner command.
     * @param params - The parameters for the change owner command.
     */
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

    /**
     * Parses a mint transaction.
     * @param tx - The transaction to parse.
     * @returns The parsed mint transaction, or undefined if parsing failed.
     */
    static parseMint(tx: Transaction): NftMint | undefined {
        try {
            const body = tx.inMessage?.body.beginParse()

            if (body === undefined) return undefined 

            const op = body.loadUint(32)
            
            if (op !== 1) return undefined 


            if (!isEligibleTransaction(tx)) {
                return undefined
            }

            return {
                queryId: body.loadUint(64),
                from: tx.inMessage?.info.src ?? undefined,
                to: tx.inMessage?.info.dest ?? undefined,
                itemIndex: body.loadUint(64),
                passAmount: body.loadCoins(),
                nftItemMessage: body.loadRef()
            }
        } catch (e) { /* empty */ }
        return undefined
    }


    /**
     * Parses an ownership transfer transaction.
     * @param tx - The transaction to parse.
     * @returns The parsed ownership transfer transaction, or undefined if parsing failed.
     */
    static parseOwnershipTransfer(tx: Transaction): OwnershipTransfer | undefined {
        try {
            const body = tx.inMessage?.body.beginParse()

            if (body === undefined) return undefined 

            const op = body.loadUint(32)
            
            if (op !== 3) return undefined 

            if (!isEligibleTransaction(tx)) {
                return undefined
            }

            return {
                queryId: body.loadUint(64),
                oldOwner: tx.inMessage?.info.src ?? undefined,
                newOwner: body.loadAddress()
            }
        } catch (e) { /* empty */ }

        return undefined
    }
}

/**
 * Type definition for the data of an NFT collection.
 */
export type NftCollectionData = {
    ownerAddress: Address,
    nextItemIndex: number | bigint
    collectionContent: string
    commonContent: string
    nftItemCode: Cell
    royaltyParams: RoyaltyParams
}

/**
 * Type definition for the data of an NFT mint transaction.
 */
export type NftMint = {
    queryId: number
    from?: Address | Maybe<ExternalAddress>
    to?: Address | Maybe<ExternalAddress>
    itemIndex: number
    passAmount: bigint
    nftItemMessage: Cell
}

/**
 * Type definition for the data of an ownership transfer transaction.
 */
export type OwnershipTransfer = {
    queryId: number
    oldOwner?: Address | Maybe<ExternalAddress>
    newOwner: Address
}