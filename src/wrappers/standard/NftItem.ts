import { Address, beginCell, Cell, Contract, ContractProvider, Sender, Transaction, SendMode, ExternalAddress } from 'ton-core'
import { isEligibleTransaction } from '../../utils/EligibleInternalTx'
import { Maybe } from 'ton-core/dist/utils/maybe'

/**
 * Represents an NFT item contract. 
 */
export class NftItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    /**
     * Sends a transfer from the contract.
     * @param provider - The ContractProvider to facilitate the transfer.
     * @param via - The Sender initiating the transfer.
     * @param params - The parameters for the transfer.
     */
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

    /**
     * Gets static data from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @param via - The Sender initiating the data retrieval.
     * @param params - The parameters for the data retrieval.
     */
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

    // Getter Functions

    /**
     * Retrieves the data of the NFT from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     */
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

    // Transaction Parsing

    /**
     * Parses a transfer transaction.
     * @param tx - The Transaction to be parsed.
     * @returns A NftTransfer object if the transaction is valid, undefined otherwise.
     */
    static parseTransfer(tx: Transaction): NftTransfer | undefined {
        try {
            const body = tx.inMessage?.body.beginParse()

            if (body === undefined) return undefined 

            const op = body.loadUint(32)
            
            if (op !== 0x5fcc3d14) return undefined 

            if (!isEligibleTransaction(tx)) {
                return undefined
            } 

            return {
                queryId: body.loadUint(64),
                from: tx.inMessage?.info.src ?? undefined,
                to: body.loadAddress(),
                responseTo: body.loadAddress(),
                customPayload: body.loadMaybeRef(),
                forwardAmount: body.loadCoins(),
                forwardPayload: body.loadMaybeRef(),
            }
        } catch (e) { console.log(e) }

        return undefined
    }
}

/**
 * Represents the data structure of an NFT transfer.
 */
export type NftTransfer = {
    queryId: number
    from?: Address | Maybe<ExternalAddress>
    to: Address
    responseTo?: Address
    customPayload: Cell | null
    forwardAmount: bigint
    forwardPayload: Cell | null
}