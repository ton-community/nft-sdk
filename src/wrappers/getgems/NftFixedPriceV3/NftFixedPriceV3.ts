import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'

/**
 * Class representing a NFT fixed price sale contract V3
 */
export class NftFixedPriceV3 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static code = Cell.fromBoc(Buffer.from('te6cckECDAEAAqAAART/APSkE/S88sgLAQIBIAMCAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vACAUgFBABXoDhZ2omhpgGmP/SB9IH0gfQBqaYAYGGh9IH0AfSB9ABhBCCMkrCgFYACqwECAs0IBgH3ZghA7msoAUmCgUjC+8uHCJND6QPoA+kD6ADBTkqEhoVCHoRagUpBwgBDIywVQA88WAfoCy2rJcfsAJcIAJddJwgKwjhdQRXCAEMjLBVADzxYB+gLLaslx+wAQI5I0NOJacIAQyMsFUAPPFgH6AstqyXH7AHAgghBfzD0UgcAlsjLHxPLPyPPFlADzxbKAIIJycOA+gLKAMlxgBjIywUmzxZw+gLLaszJgwb7AHFVUHAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVAP10A6GmBgLjYSS+CcH0gGHaiaGmAaY/9IH0gfSB9AGppgBgYOCmE44BgAEwthGmP6Z+lVW8Q4AHxgRDAgRXdFOAA2CnT44LYTwhWL4ZqGGhpg+oYAP2AcBRgAPloyhJrpOEBWfGBHByUYABOGxuIHCOyiiGYOHgC8BRgAMCwoJAC6SXwvgCMACmFVEECQQI/AF4F8KhA/y8ACAMDM5OVNSxwWSXwngUVHHBfLh9IIQBRONkRW68uH1BPpAMEBmBXAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVADYMTc4OYIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxXLPyfPFifPFhTKACP6AhPKAMmAQPsAcVBmRRUEcAfIywAWyx9QBM8WWM8WAc8WAfoCzMsAye1UM/Vflw==', 'base64'))[0]

    /**
     * Builds the data cell for an NFT fixed price sale.
     * @param data - The data for the NFT sale.
     * @returns A cell containing the data for the NFT sale.
     */
    static buildDataCell(data: NftFixPriceSaleV3Data) {
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

    /**
     * Creates an NftFixedPriceV3 instance from an address.
     * @param address - The address to create from.
     * @returns A new NftFixedPriceV3 instance.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftFixedPriceV3(
            address
        )
    }

    /**
     * Creates an NftFixedPriceV3 instance from a configuration object.
     * @param config - The configuration data for the NFT sale.
     * @param workchain - The workchain ID (default is 0).
     * @returns A new NftFixedPriceV3 instance.
     */
    static async createFromConfig(
        config: NftFixPriceSaleV3Data,
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

        return new NftFixedPriceV3(
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

    /**
     * Sends a command to cancel the sale.
     * @param provider - The contract provider.
     * @param via - The sender of the command.
     * @param params - Parameters for the operation, including the value and queryId.
     */
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

    /**
     * Sends a command to buy the NFT.
     * @param provider - The contract provider.
     * @param via - The sender of the command.
     * @param params - Parameters for the operation, including the value and queryId.
     */
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

    /**
     * Retrieves the sale data from the contract.
     * @param provider - The contract provider.
     * @returns An object containing the sale data.
     */
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

/**
 * Type definition for the data of an NFT fixed price sale.
 */
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
  