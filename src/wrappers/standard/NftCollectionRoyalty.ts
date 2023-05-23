import { Address, ContractProvider, Sender, SendMode, beginCell } from 'ton-core'
import { NftCollection } from './NftCollection'

/**
 * Represents a collection of NFT items with royalty features.
 * Inherits from the NftCollection class.
 */
export class NftCollectionRoyalty extends NftCollection {
    /**
     * Constructs an instance of the NftCollectionRoyalty contract from an address.
     * @param address - The address of the contract.
     * @returns An instance of NftCollectionRoyalty.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftCollectionRoyalty(
            address
        )
    }

    /**
     * Sends a request to get the royalty parameters from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @param via - The Sender initiating the data retrieval.
     * @param params - The parameters for the data retrieval.
     */
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

    /**
     * Retrieves the royalty parameters of the NFT collection from the contract.
     * @param provider - The ContractProvider to facilitate the data retrieval.
     * @returns An object with the royalty parameters.
     */
    async getRoyaltyParams(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('royalty_params', [])
        return {
            init: stack.readBoolean(),
            numerator: stack.readBigNumber(),
            denominator: stack.readBigNumber(),
            destination: stack.readAddressOpt()
        }
    }

}