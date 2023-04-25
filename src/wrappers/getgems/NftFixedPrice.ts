import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core';

export class NftFixedPrice implements Contract {
    readonly address: Address;
    readonly init: { code: Cell, data: Cell };

    constructor(
        address: Address, 
        workchain: number, 
        init: { 
            code: Cell; 
            data: Cell 
        }
    ) {
        this.init = init;
        this.address = contractAddress(workchain, this.init);
    }

    static createFromAddress(
        address: Address,
        workchain: number,
        init: { 
            code: Cell; 
            data: Cell 
        }
    ) {
        return new NftFixedPrice(
            address,
            workchain,
            init
            );
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

export function buildNftFixPriceSaleDataCell(data: NftFixPriceSaleData) {

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