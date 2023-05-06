import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'

export class NftOffer implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    // Data

    static NftOfferCodeBoc = 'te6cckECFgEABEkAART/APSkE/S88sgLAQIBIAQCAVby7UTQ0wDTH9Mf+kD6QPpA+gDU0wAwMAfAAfLRlPgjJb7jAl8IggD//vLwAwDOB9MfgQ+jAsMAEvLygQ+kIddKwwDy8oEPpSHXSYEB9Lzy8vgAgggPQkBw+wJwIIAQyMsFJM8WIfoCy2rLHwHPFsmDBvsAcQdVBXAIyMsAF8sfFcsfUAPPFgHPFgHPFgH6AszLAMntVAIBSAYFAIOhRh/aiaGmAaY/pj/0gfSB9IH0AammAGBhofSBpj+mP/SBpj+mPmCo7CHgBqjuqeAGpQVCA0MEMJ6MjIqkHYACq4ECAswLBwP322ERFofSBpj+mP/SBpj+mPmBSs+AGqJCH4Aam4UJHQxbKDk3szS6QTrLgQQAhkZYKoAueLKAH9AQnltWWPgOeLZLj9gBFhABFrpOEBWEk2EPGGkGEASK3xhrgQQQgv5h6KZGWPieWfk2eLKAHni2UAQQRMS0B9AWUAZLjAoJCAB4gBjIywUmzxZw+gLLasyCCA9CQHD7AsmDBvsAcVVgcAjIywAXyx8Vyx9QA88WAc8WAc8WAfoCzMsAye1UAEyLlPZmZlciBmZWWHAggBDIywVQBc8WUAP6AhPLassfAc8WyXH7AABYi+T2ZmZXIgcm95YWxpZXOBNwIIAQyMsFUAXPFlAD+gITy2rLHwHPFslx+wACAUgPDAIBIA4NAB0IMAAk18DcOBZ8AIB8AGAAESCEDuaygCphIAIBIBEQABMghA7msoAAamEgAfcAdDTAwFxsJJfBOD6QDDtRNDTANMf0x/6QPpA+kD6ANTTADDAAY4lMTc3OFUzEnAIyMsAF8sfFcsfUAPPFgHPFgHPFgH6AszLAMntVOB/KscBwACOGjAJ0x8hwACLZjYW5jZWyFIgxwWwknMy3lCq3iCBAiu6KcABsFOmgEgLQxwWwnhCsXwzUMNDTB9QwAfsA4IIQBRONkVIQuuMCPCfAAfLRlCvAAFOTxwWwjis4ODlQdqAQN0ZQRAMCcAjIywAXyx8Vyx9QA88WAc8WAc8WAfoCzMsAye1U4Dc5CcAD4wJfCYQP8vAVEwGsU1jHBVNixwWx8uHKgggPQkBw+wJRUccFjhQ1cIAQyMsFKM8WIfoCy2rJgwb7AOMNcUcXUGYFBANwCMjLABfLHxXLH1ADzxYBzxYBzxYB+gLMywDJ7VQUALYF+gAhghAdzWUAvJeCEB3NZQAy3o0EE9mZmVyIGNhbmNlbCBmZWWBURzNwIIAQyMsFUAXPFlAD+gITy2rLHwHPFslx+wDUMHGAEMjLBSnPFnD6AstqzMmDBvsAAMYwCdM/+kAwU5THBQnAABmwK4IQO5rKAL6wnjgQWhBJEDhHFQNEZPAIjjg5XwYzM3AgghBfzD0UyMsfE8s/I88WUAPPFsoAIfoCygDJcYAYyMsFUAPPFnD6AhLLaszJgED7AOK1Lpfy'

    static NftOfferCodeCell = Cell.fromBoc(Buffer.from(this.NftOfferCodeBoc, 'base64'))[0]

    static buildNftOfferDataCell(data: NftOfferData) {
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

    static createFromAddress(
        address: Address
    ) {
        return new NftOffer(
            address
        )
    }

    static async createFromConfig(
        config: NftOfferData,
        workchain = 0
    ) {

        const data = this.buildNftOfferDataCell(config)
        const address = contractAddress(
            workchain,
            {
                code: this.NftOfferCodeCell,
                data: data
            }
        )

        return new NftOffer(
            address,
            {
                code: this.NftOfferCodeCell,
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

// Utils

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