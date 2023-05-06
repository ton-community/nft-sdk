import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'

export class NftAuction implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}
    
    static code = Cell.fromBoc(Buffer.from('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', 'base64'))[0]

    static buildNftAuctionDataCell(data: NftAuctionData) {

        const feesCell = beginCell()
        feesCell.storeAddress(data.marketplaceFeeAddress)      // mp_fee_addr
        feesCell.storeUint(data.marketplaceFeeFactor, 32)               // mp_fee_factor
        feesCell.storeUint(data.marketplaceFeeBase, 32)   // mp_fee_base
        feesCell.storeAddress(data.royaltyAddress)  // royalty_fee_addr
        feesCell.storeUint(data.royaltyFactor, 32)              // royalty_fee_factor
        feesCell.storeUint(data.royaltyBase, 32)   // royalty_fee_base


        const bidsCell = beginCell()
        bidsCell.storeCoins(data.minBid)       // min_bid
        bidsCell.storeCoins(data.maxBid)       // max_bid
        bidsCell.storeCoins(data.minStep)       // min_step
        bidsCell.storeBuffer(Buffer.from([0,0]))        // last_member
        bidsCell.storeCoins(0)       // last_bid
        bidsCell.storeUint(0, 32) // last_bid_at
        bidsCell.storeUint(data.endTimestamp, 32)    // end_time
        bidsCell.storeUint(data.stepTimeSeconds, 32)               // step_time
        bidsCell.storeUint(data.tryStepTimeSeconds, 32)               // try_step_time

        const nftCell = beginCell()
        if (data.nftOwnerAddress) {
            nftCell.storeAddress(data.nftOwnerAddress)
        } else {
            nftCell.storeBuffer(Buffer.from([0, 0]))
        }
        nftCell.storeAddress(data.nftAddress)          // nft_addr


        const storage = beginCell()
        storage.storeBit(data.end)     // end?
        storage.storeAddress(data.marketplaceAddress)   // mp_addr
        storage.storeBit(data.activated)    // activated
        storage.storeUint(data.createdAtTimestamp, 32)
        storage.storeBit(false) // is_canceled
        storage.storeRef(feesCell.endCell())
        storage.storeRef(bidsCell.endCell())
        storage.storeRef(nftCell.endCell())

        return storage.endCell()
    }

    static createFromAddress(
        address: Address
    ) {
        return new NftAuction(
            address
        )
    }

    static async createFromConfig(
        config: NftAuctionData,
        workchain = 0
    ) {

        const data = this.buildNftAuctionDataCell(config)
        const address = contractAddress(
            workchain,
            {
                code: this.code,
                data: data
            }
        )

        return new NftAuction(
            address,
            {
                code: this.code,
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
        const transfer = beginCell()
        transfer.storeUint(0x18, 6)
        transfer.storeAddress(params.marketplaceAddress)
        transfer.storeCoins(params.coins)
        transfer.storeUint(1, 1 + 4 + 4 + 64 + 32 + 1 + 1)
        transfer.storeRef(beginCell().storeUint(555,32).endCell())

        const transferBox = beginCell()
        transferBox.storeUint(2, 8)
        transferBox.storeRef(transfer.endCell())

        const msgResend = beginCell().storeUint(0, 32).storeBuffer(Buffer.from('emergency_message')).storeRef(transferBox.endCell()).endCell()

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

// Utils

export type NftAuctionData = {
    marketplaceFeeAddress: Address,
    marketplaceFeeFactor: bigint,
    marketplaceFeeBase: bigint,


    royaltyAddress: Address,
    royaltyFactor: bigint,
    royaltyBase: bigint,


    minBid: bigint,
    maxBid: bigint,
    minStep: bigint,
    endTimestamp: number,
    createdAtTimestamp: number,

    stepTimeSeconds: number,
    tryStepTimeSeconds: number,

    nftOwnerAddress: Address | null,
    nftAddress: Address,

    end: boolean,
    marketplaceAddress: Address,
    activated: boolean,
}