import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core';

export class NftAuction implements Contract {
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
        return new NftAuction(
            address,
            workchain,
            init
            );
    }

    async sendCancel(provider: ContractProvider, via: Sender, params: { 
        value: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0,32)
                .storeBuffer(Buffer.from('cancel'))
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }
    
    async sendStop(provider: ContractProvider, via: Sender, params: { 
        value: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0,32)
                .storeBuffer(Buffer.from('cancel'))
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendRepeatEndAuction(provider: ContractProvider, via: Sender, params: { 
        value: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0,32)
                .storeBuffer(Buffer.from('repeat_end_auction'))
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendEmergencyMessage(provider: ContractProvider, via: Sender, params: { 
        value: bigint,
        marketplaceAddress: Address,
        coins: bigint
    }) {
        const transfer = beginCell();
        transfer.storeUint(0x18, 6)
        transfer.storeAddress(params.marketplaceAddress)
        transfer.storeCoins(params.coins)
        transfer.storeUint(1, 1 + 4 + 4 + 64 + 32 + 1 + 1)
        transfer.storeRef(beginCell().storeUint(555,32).endCell())

        const transferBox = beginCell()
        transferBox.storeUint(2, 8)
        transferBox.storeRef(transfer.endCell())

        const msgResend = beginCell().storeUint(0, 32).storeBuffer(Buffer.from("emergency_message")).storeRef(transferBox.endCell()).endCell()

        await provider.internal(via, {
            value: params.value,
            body: msgResend,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async getSaleData(provider: ContractProvider) {
        const { stack } = await provider.get('get_sale_data', [])
        
        // pops out saleType
        stack.pop()
        
        return {
            // saleType: stack.readBigNumber(),
            end: stack.readBoolean(),
            endTimestamp: stack.readBigNumber(),
            marketplaceAddress: stack.readAddressOpt(),
            nftAddress: stack.readAddressOpt(),
            nftOwnerAddress: stack.readAddressOpt(),
            lastBidAmount: stack.readBigNumber(),
            lastBidAddress: stack.readAddressOpt(),
            minStep: stack.readBigNumber(),
            marketplaceFeeAddress: stack.readAddressOpt(),
            marketplaceFeeFactor: stack.readBigNumber(), 
            marketplaceFeeBase: stack.readBigNumber(),
            royaltyAddress: stack.readAddressOpt(),
            royaltyFactor: stack.readBigNumber(), 
            royaltyBase: stack.readBigNumber(),
            maxBid: stack.readBigNumber(),
            minBid: stack.readBigNumber(),
            createdAt: stack.readBigNumber(),
            lastBidAt: stack.readBigNumber(),
            isCanceled: stack.readBigNumber(),
        }
    }
}
