import { Address, beginCell, Cell, Contract, ContractProvider, Sender, contractAddress } from 'ton-core'

/**
 * Class representing a Non-Fungible Token (NFT) fixed price sale contract.
 */
export class NftFixedPrice implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static code = Cell.fromBoc(Buffer.from('te6cckECCgEAAbIAART/APSkE/S88sgLAQIBIAMCAATyMAIBSAUEADegOFnaiaH0gfSB9IH0AahhofQB9IH0gfQAYCBHAgLNCAYB99G8EIHc1lACkgUCkQX3lw4QFofQB9IH0gfQAYOEAIZGWCqATniyi6UJDQqFrQilAK/QEK5bVkuP2AOEAIZGWCrGeLKAP9AQtltWS4/YA4QAhkZYKsZ4ssfQFltWS4/YA4EEEIL+YeihDADGRlgqgC54sRfQEKZbUJ5Y+JwHAC7LPyPPFlADzxYSygAh+gLKAMmBAKD7AAH30A6GmBgLjYSS+CcH0gGHaiaH0gfSB9IH0AahgRa6ThAVnHHZkbGymQ44LJL4NwKJFjgvlw+gFpj8EIAonGyIldeXD66Z+Y/SAYIBpkKALniygB54sA54sA/QFmZPaqcBNjgEybCBsimYI4eAJwA2mP6Z+YEOAAyS+FcBDAkAtsACmjEQRxA2RUAS8ATgMjQ0NDXAA449ghA7msoAE77y4clwIIIQX8w9FCGAEMjLBVAHzxYi+gIWy2oVyx8Tyz8hzxYBzxYSygAh+gLKAMmBAKD7AOBfBIQP8vCVeDe4', 'base64'))[0]

    /**
     * Builds the data cell for an NFT fixed price sale.
     * @param data - The data for the NFT sale.
     * @returns A cell containing the data for the NFT sale.
     */
    static buildDataCell(data: NftFixPriceSaleData) {

        const feesCell = beginCell()
    
        feesCell.storeCoins(data.marketplaceFee)
        feesCell.storeAddress(data.marketplaceFeeAddress)
        feesCell.storeAddress(data.royaltyAddress)
        feesCell.storeCoins(data.royaltyAmount)
    
        const dataCell = beginCell()
    
        dataCell.storeAddress(data.marketplaceAddress)
        dataCell.storeAddress(data.nftAddress)
        dataCell.storeAddress(data.nftOwnerAddress)
        dataCell.storeCoins(data.fullPrice)
        dataCell.storeRef(feesCell)
    
        return dataCell.endCell()
    }

    /**
     * Creates an NftFixedPrice instance from an address.
     * @param address - The address to create from.
     * @returns A new NftFixedPrice instance.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftFixedPrice(
            address
        )
    }

    /**
     * Creates an NftFixedPrice instance from a configuration object.
     * @param config - The configuration data for the NFT sale.
     * @param workchain - The workchain ID (default is 0).
     * @returns A new NftFixedPrice instance.
     */
    static async createFromConfig(
        config: NftFixPriceSaleData,
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

        return new NftFixedPrice(
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
     * Retrieves the sale data from the contract.
     * @param provider - The contract provider.
     * @returns An object containing the sale data.
     */
    async getSaleData(provider: ContractProvider) {
        const { stack } = await provider.get('get_sale_data', [])
        return {
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
export type NftFixPriceSaleData = {
    marketplaceAddress: Address
    nftAddress: Address
    nftOwnerAddress: Address|null
    fullPrice: bigint
    marketplaceFee: bigint
    marketplaceFeeAddress: Address
    royaltyAmount: bigint
    royaltyAddress: Address
}