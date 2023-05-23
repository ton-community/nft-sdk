import { Address, beginCell, ContractProvider, Sender, SendMode } from 'ton-core'
import { NftItem } from './NftItem'

/**
 * Represents an NFT item contract with royalty features.
 * Inherits from the NftItem class.
 */
export class NftItemRoyalty extends NftItem {
    /**
     * Constructs an instance of the NftItemRoyalty contract from an address.
     * @param address - The address of the contract.
     * @returns An instance of NftItemRoyalty.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftItemRoyalty(
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
     * Retrieves the royalty parameters of the NFT from the contract.
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

