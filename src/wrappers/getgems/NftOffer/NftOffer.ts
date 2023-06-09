import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'

/**
 * Class representing a Non-Fungible Token (NFT) Offer contract.
 */
export class NftOffer implements Contract {
    /**
     * Constructs an instance of the NftOffer contract.
     * @param address - The address of the contract.
     * @param init - The initial code and data for the contract.
     */
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static code = Cell.fromBoc(Buffer.from('te6cckECFgEABEkAART/APSkE/S88sgLAQIBIAQCAVby7UTQ0wDTH9Mf+kD6QPpA+gDU0wAwMAfAAfLRlPgjJb7jAl8IggD//vLwAwDOB9MfgQ+jAsMAEvLygQ+kIddKwwDy8oEPpSHXSYEB9Lzy8vgAgggPQkBw+wJwIIAQyMsFJM8WIfoCy2rLHwHPFsmDBvsAcQdVBXAIyMsAF8sfFcsfUAPPFgHPFgHPFgH6AszLAMntVAIBSAYFAIOhRh/aiaGmAaY/pj/0gfSB9IH0AammAGBhofSBpj+mP/SBpj+mPmCo7CHgBqjuqeAGpQVCA0MEMJ6MjIqkHYACq4ECAswLBwP322ERFofSBpj+mP/SBpj+mPmBSs+AGqJCH4Aam4UJHQxbKDk3szS6QTrLgQQAhkZYKoAueLKAH9AQnltWWPgOeLZLj9gBFhABFrpOEBWEk2EPGGkGEASK3xhrgQQQgv5h6KZGWPieWfk2eLKAHni2UAQQRMS0B9AWUAZLjAoJCAB4gBjIywUmzxZw+gLLasyCCA9CQHD7AsmDBvsAcVVgcAjIywAXyx8Vyx9QA88WAc8WAc8WAfoCzMsAye1UAEyLlPZmZlciBmZWWHAggBDIywVQBc8WUAP6AhPLassfAc8WyXH7AABYi+T2ZmZXIgcm95YWxpZXOBNwIIAQyMsFUAXPFlAD+gITy2rLHwHPFslx+wACAUgPDAIBIA4NAB0IMAAk18DcOBZ8AIB8AGAAESCEDuaygCphIAIBIBEQABMghA7msoAAamEgAfcAdDTAwFxsJJfBOD6QDDtRNDTANMf0x/6QPpA+kD6ANTTADDAAY4lMTc3OFUzEnAIyMsAF8sfFcsfUAPPFgHPFgHPFgH6AszLAMntVOB/KscBwACOGjAJ0x8hwACLZjYW5jZWyFIgxwWwknMy3lCq3iCBAiu6KcABsFOmgEgLQxwWwnhCsXwzUMNDTB9QwAfsA4IIQBRONkVIQuuMCPCfAAfLRlCvAAFOTxwWwjis4ODlQdqAQN0ZQRAMCcAjIywAXyx8Vyx9QA88WAc8WAc8WAfoCzMsAye1U4Dc5CcAD4wJfCYQP8vAVEwGsU1jHBVNixwWx8uHKgggPQkBw+wJRUccFjhQ1cIAQyMsFKM8WIfoCy2rJgwb7AOMNcUcXUGYFBANwCMjLABfLHxXLH1ADzxYBzxYBzxYB+gLMywDJ7VQUALYF+gAhghAdzWUAvJeCEB3NZQAy3o0EE9mZmVyIGNhbmNlbCBmZWWBURzNwIIAQyMsFUAXPFlAD+gITy2rLHwHPFslx+wDUMHGAEMjLBSnPFnD6AstqzMmDBvsAAMYwCdM/+kAwU5THBQnAABmwK4IQO5rKAL6wnjgQWhBJEDhHFQNEZPAIjjg5XwYzM3AgghBfzD0UyMsfE8s/I88WUAPPFsoAIfoCygDJcYAYyMsFUAPPFnD6AhLLaszJgED7AOK1Lpfy', 'base64'))[0]

    /**
     * Builds the data cell for an NFT offer.
     * @param data - The data for the NFT offer.
     * @returns A cell containing the data for the NFT offer.
     */
    static buildDataCell(data: NftOfferData) {
        const feesCell = beginCell()
    
        feesCell.storeAddress(data.marketplaceFeeAddress)
        feesCell.storeUint(data.marketplaceFactor, 32)
        feesCell.storeUint(data.marketplaceBase, 32)
        feesCell.storeAddress(data.royaltyAddress)
        feesCell.storeUint(data.royaltyFactor, 32)
        feesCell.storeUint(data.royaltyBase, 32)
    
        const dataCell = beginCell()
    
        dataCell.storeUint(data.isComplete ? 1 : 0, 1)
        dataCell.storeUint(data.createdAt, 32)
        dataCell.storeUint(data.finishAt, 32)
        dataCell.storeAddress(data.marketplaceAddress)
        dataCell.storeAddress(data.nftAddress)
        dataCell.storeAddress(data.offerOwnerAddress)
        dataCell.storeCoins(data.fullPrice) // fullPrice
        dataCell.storeRef(feesCell)
        dataCell.storeUint(1, 1) // can_deploy
    
        return dataCell.endCell()
    }

    /**
     * Creates an NftOffer instance from an address.
     * @param address - The address to create from.
     * @returns A new NftOffer instance.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftOffer(
            address
        )
    }

    /**
     * Creates an NftOffer instance from a configuration object.
     * @param config - The configuration data for the NFT offer.
     * @param workchain - The workchain ID (default is 0).
     * @returns A new NftOffer instance.
     */
    static async createFromConfig(
        config: NftOfferData,
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

        return new NftOffer(
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
     * Sends a cancel offer command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the cancel command.
     * @param params - Parameters for the cancel command including optional message and value.
     */
    async sendCancelOffer(provider: ContractProvider, via: Sender, params: { 
        message?: string,
        value: bigint
    }) {
        const nextPayload = beginCell()

        if (params.message) {
            nextPayload.storeUint(0, 32)
            const m = Buffer.from(params.message.substring(0, 121), 'utf-8')
            nextPayload.storeBuffer(m.slice(0, 121))
        }

        nextPayload.endCell()

        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0,32)
                .storeBuffer(Buffer.from('cancel'))
                .storeRef(nextPayload)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Sends a cancel offer command to the contract by the marketplace.
     * @param provider - The contract provider.
     * @param via - The sender of the cancel command.
     * @param params - Parameters for the cancel command including amount, optional message and value.
     */
    async sendCancelOfferByMarketplace(provider: ContractProvider, via: Sender, params: { 
        amount: bigint; 
        message?: string 
        value: bigint
    }) {
        const nextPayload = beginCell()

        if (params.message) {
            nextPayload.storeUint(0, 32)
            const m = Buffer.from(params.message.substring(0, 121), 'utf-8')
            nextPayload.storeBuffer(m.slice(0, 121))
        }

        nextPayload.endCell()

        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(3,32)
                .storeCoins(params.amount)
                .storeRef(nextPayload)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Gets the data of the offer.
     * @param provider - The contract provider.
     * @returns The current data of the offer.
     */
    async getOfferData(provider: ContractProvider) {
        const { stack } = await provider.get('get_offer_data', [])

        return {
            offerType: stack.readBigNumber(),
            isComplete: stack.readBoolean(),
            createdAt: stack.readBigNumber(),
            finishAt: stack.readBigNumber(),
            marketplaceAddress: stack.readAddress(),
            nftAddress: stack.readAddress(),
            offerOwnerAddress: stack.readAddress(),
            fullPrice: stack.readBigNumber(),
            marketplaceFeeAddress: stack.readAddress(),
            marketplaceFactor: stack.readBigNumber(),
            marketplaceBase: stack.readBigNumber(),
            royaltyAddress: stack.readAddress(),
            royaltyFactor: stack.readBigNumber(),
            royaltyBase: stack.readBigNumber(),
            profitPrice: stack.readBigNumber(),
        }
    }
}

/**
 * Type definition for the data of an NFT offer.
 */
export type NftOfferData = {
    isComplete: boolean
    createdAt: number
    finishAt: number
    marketplaceAddress: Address
    nftAddress: Address
    offerOwnerAddress: Address
    fullPrice: bigint
    marketplaceFeeAddress: Address
    royaltyAddress: Address
    marketplaceFactor: number
    marketplaceBase: number
    royaltyFactor: number
    royaltyBase: number
}