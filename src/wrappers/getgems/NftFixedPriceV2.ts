import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core';

export class NftFixedPriceV2 implements Contract {
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
        return new NftFixedPriceV2(
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
            body: beginCell().
                storeUint(params.queryId || 0, 32).
                endCell(),
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

export type NftFixPriceSaleV2Data = {
    isComplete: boolean
    createdAt: number
    marketplaceAddress: Address
    nftAddress: Address
    nftOwnerAddress: Address|null
    fullPrice: bigint
    marketplaceFeeAddress: Address
    marketplaceFee: bigint
    royaltyAddress: Address
    royaltyAmount: bigint
}

export function buildNftFixPriceSaleV2DataCell(data: NftFixPriceSaleV2Data) {

    let feesCell = beginCell()

    feesCell.storeAddress(data.marketplaceFeeAddress)
    feesCell.storeCoins(data.marketplaceFee)
    feesCell.storeAddress(data.royaltyAddress)
    feesCell.storeCoins(data.royaltyAmount)

    let dataCell = beginCell()

    dataCell.storeUint(data.isComplete ? 1 : 0, 1)
    dataCell.storeUint(data.createdAt, 32)
    dataCell.storeAddress(data.marketplaceAddress)
    dataCell.storeAddress(data.nftAddress)
    dataCell.storeAddress(data.nftOwnerAddress)
    dataCell.storeCoins(data.fullPrice)
    dataCell.storeRef(feesCell)

    return dataCell.endCell()
}