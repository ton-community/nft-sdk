import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'

export class NftFixedPriceV3 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    // Data

    static NftFixPriceSaleV3CodeBoc = 'te6cckECDAEAAqAAART/APSkE/S88sgLAQIBIAMCAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vACAUgFBABXoDhZ2omhpgGmP/SB9IH0gfQBqaYAYGGh9IH0AfSB9ABhBCCMkrCgFYACqwECAs0IBgH3ZghA7msoAUmCgUjC+8uHCJND6QPoA+kD6ADBTkqEhoVCHoRagUpBwgBDIywVQA88WAfoCy2rJcfsAJcIAJddJwgKwjhdQRXCAEMjLBVADzxYB+gLLaslx+wAQI5I0NOJacIAQyMsFUAPPFgH6AstqyXH7AHAgghBfzD0UgcAlsjLHxPLPyPPFlADzxbKAIIJycOA+gLKAMlxgBjIywUmzxZw+gLLaszJgwb7AHFVUHAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVAP10A6GmBgLjYSS+CcH0gGHaiaGmAaY/9IH0gfSB9AGppgBgYOCmE44BgAEwthGmP6Z+lVW8Q4AHxgRDAgRXdFOAA2CnT44LYTwhWL4ZqGGhpg+oYAP2AcBRgAPloyhJrpOEBWfGBHByUYABOGxuIHCOyiiGYOHgC8BRgAMCwoJAC6SXwvgCMACmFVEECQQI/AF4F8KhA/y8ACAMDM5OVNSxwWSXwngUVHHBfLh9IIQBRONkRW68uH1BPpAMEBmBXAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVADYMTc4OYIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxXLPyfPFifPFhTKACP6AhPKAMmAQPsAcVBmRRUEcAfIywAWyx9QBM8WWM8WAc8WAfoCzMsAye1UM/Vflw=='

    static NftFixPriceSaleV3CodeCell = Cell.fromBoc(Buffer.from(this.NftFixPriceSaleV3CodeBoc, 'base64'))[0]

    static buildNftFixPriceSaleV3DataCell(data: NftFixPriceSaleV3Data) {
        const feesCell = beginCell()
    
        feesCell.storeAddress(data.marketplaceFeeAddress)
        feesCell.storeCoins(data.marketplaceFee)
        feesCell.storeAddress(data.royaltyAddress)
        feesCell.storeCoins(data.royaltyAmount)
    
        const dataCell = beginCell()
    
        dataCell.storeUint(data.isComplete ? 1 : 0, 1)
        dataCell.storeUint(data.createdAt, 32)
        dataCell.storeAddress(data.marketplaceAddress)
        dataCell.storeAddress(data.nftAddress)
        dataCell.storeAddress(data.nftOwnerAddress)
        dataCell.storeCoins(data.fullPrice)
        dataCell.storeRef(feesCell)
        dataCell.storeUint(data.canDeployByExternal ? 1 : 0, 1) // can_deploy_by_external
    
        return dataCell.endCell()
    }

    static createFromAddress(
        address: Address
    ) {
        return new NftFixedPriceV3(
            address
        )
    }


    static async createFromConfig(
        config: NftFixPriceSaleV3Data,
        workchain = 0
    ) {

        const data = this.buildNftFixPriceSaleV3DataCell(config)
        const address = contractAddress(
            workchain,
            {
                code: this.NftFixPriceSaleV3CodeCell,
                data: data
            }
        )

        return new NftFixedPriceV3(
            address,
            {
                code: this.NftFixPriceSaleV3CodeCell,
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

    async sendCancelSale(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(3, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendBuy(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell().endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async getSaleData(provider: ContractProvider) {
        const { stack } = await provider.get('get_sale_data', [])

        // pops out saleType
        stack.pop()

        return {
            // saleType: stack.readBigNumber(),
            isComplete: stack.readBigNumber(),
            createdAt: stack.readBigNumber(),
            marketplaceAddress: stack.readAddressOpt(),
            nftAddress: stack.readAddressOpt(),
            nftOwnerAddress: stack.readAddressOpt(),
            fullPrice: stack.readBigNumber(),
            marketplaceFeeAddress: stack.readAddressOpt(),
            marketplaceFee: stack.readBigNumber(),
            royaltyAddress: stack.readAddressOpt(),
            royaltyAmount:  stack.readBigNumber()
        }
    }
}

// Utils

export type NftFixPriceSaleV3Data = {
    isComplete: boolean
    createdAt: number
    marketplaceAddress: Address
    nftAddress: Address
    nftOwnerAddress: Address | null
    fullPrice: bigint
    marketplaceFeeAddress: Address
    marketplaceFee: bigint
    royaltyAddress: Address
    royaltyAmount: bigint
    canDeployByExternal?: boolean
  }
  