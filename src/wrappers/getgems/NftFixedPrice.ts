import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core';

export class NftFixedPrice implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    // Data

    static NftFixPriceSaleCodeBoc = 'te6cckECCgEAAbIAART/APSkE/S88sgLAQIBIAMCAATyMAIBSAUEADegOFnaiaH0gfSB9IH0AahhofQB9IH0gfQAYCBHAgLNCAYB99G8EIHc1lACkgUCkQX3lw4QFofQB9IH0gfQAYOEAIZGWCqATniyi6UJDQqFrQilAK/QEK5bVkuP2AOEAIZGWCrGeLKAP9AQtltWS4/YA4QAhkZYKsZ4ssfQFltWS4/YA4EEEIL+YeihDADGRlgqgC54sRfQEKZbUJ5Y+JwHAC7LPyPPFlADzxYSygAh+gLKAMmBAKD7AAH30A6GmBgLjYSS+CcH0gGHaiaH0gfSB9IH0AahgRa6ThAVnHHZkbGymQ44LJL4NwKJFjgvlw+gFpj8EIAonGyIldeXD66Z+Y/SAYIBpkKALniygB54sA54sA/QFmZPaqcBNjgEybCBsimYI4eAJwA2mP6Z+YEOAAyS+FcBDAkAtsACmjEQRxA2RUAS8ATgMjQ0NDXAA449ghA7msoAE77y4clwIIIQX8w9FCGAEMjLBVAHzxYi+gIWy2oVyx8Tyz8hzxYBzxYSygAh+gLKAMmBAKD7AOBfBIQP8vCVeDe4'

    static NftFixPriceSaleCodeCell = Cell.fromBoc(Buffer.from(this.NftFixPriceSaleCodeBoc, 'base64'))[0]

    static buildNftFixPriceSaleDataCell(data: NftFixPriceSaleData) {

        let feesCell = beginCell()
    
        feesCell.storeCoins(data.marketplaceFee)
        feesCell.storeAddress(data.marketplaceFeeAddress)
        feesCell.storeAddress(data.royaltyAddress)
        feesCell.storeCoins(data.royaltyAmount)
    
        let dataCell = beginCell()
    
        dataCell.storeAddress(data.marketplaceAddress)
        dataCell.storeAddress(data.nftAddress)
        dataCell.storeAddress(data.nftOwnerAddress)
        dataCell.storeCoins(data.fullPrice)
        dataCell.storeRef(feesCell)
    
        return dataCell.endCell()
    }

    static createFromAddress(
        address: Address
    ) {
        return new NftFixedPrice(
            address
            );
    }

    static async createFromConfig(
        config: NftFixPriceSaleData
    ) {

        let data = this.buildNftFixPriceSaleDataCell(config);
        let address = contractAddress(
            0,
            {
                code: this.NftFixPriceSaleCodeCell,
                data: data
            }
        )

        return new NftFixedPrice(
            address,
            {
                code: this.NftFixPriceSaleCodeCell,
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

// Utils

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