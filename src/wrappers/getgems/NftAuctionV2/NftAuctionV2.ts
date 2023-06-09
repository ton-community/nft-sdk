import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'

/**
 * Class representing an NFT auction contract version 2.
 */
export class NftAuctionV2 implements Contract {
    /**
     * Creates an `NftAuctionV2` instance from an address and initialization data.
     * @param address - The address of the contract.
     * @param init - The initialization data.
     * @returns A new `NftAuctionV2` instance.
     */
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static code = Cell.fromBoc(Buffer.from('te6cckECHQEABZMAART/APSkE/S88sgLAQIBIAIDAgFIBAUCKPIw2zyBA+74RMD/8vL4AH/4ZNs8GxwCAs4GBwKLoDhZtnm2eQQQgqqH8IXwofCH8KfwpfCd8JvwmfCX8JXwi/Cf8IwaIiYaGCIkGBYiIhYUIiAUIT4hHCD6INggtiD0INIgsRsaAgEgCAkCASAYGQT1AHQ0wMBcbDyQPpAMNs8+ELA//hDUiDHBbCO0DMx0x8hwACNBJyZXBlYXRfZW5kX2F1Y3Rpb26BSIMcFsI6DW9s84DLAAI0EWVtZXJnZW5jeV9tZXNzYWdlgUiDHBbCa1DDQ0wfUMAH7AOAw4PhTUhDHBY6EMzHbPOABgGxIKCwATIIQO5rKAAGphIAFcMYED6fhS10nCAvLygQPqAdMfghAFE42REroS8vSAQNch+kAw+HJw+GJ/+GTbPBwEhts8IMABjzgwgQPt+CP4UL7y8oED7fhCwP/y8oED8AKCEDuaygC5EvLy+FJSEMcF+ENSIMcFsfLhkwF/2zzbPOAgwAIMFQ0OAIwgxwDA/5IwcODTHzGLZjYW5jZWyCHHBZIwceCLRzdG9wghxwWSMHLgi2ZmluaXNoghxwWSMHLgi2ZGVwbG95gBxwWRc+BwAYpwIPglghBfzD0UyMsfyz/4Us8WUAPPFhLLACH6AssAyXGAGMjLBfhTzxZw+gLLasyCCA9CQHD7AsmDBvsAf/hif/hm2zwcBPyOwzAygQPt+ELA//LygQPwAYIQO5rKALny8vgj+FC+jhf4UlIQxwX4Q1IgxwWx+E1SIMcFsfLhk5n4UlIQxwXy4ZPi2zzgwAOSXwPg+ELA//gj+FC+sZdfA4ED7fLw4PhLghA7msoAoFIgvvhLwgCw4wL4UPhRofgjueMA+E4SDxARAiwCcNs8IfhtghA7msoAofhu+CP4b9s8FRIADvhQ+FGg+HADcI6VMoED6PhKUiC58vL4bvht+CP4b9s84fhO+EygUiC5l18DgQPo8vDgAnDbPAH4bfhu+CP4b9s8HBUcApT4TsAAjj1wIPglghBfzD0UyMsfyz/4Us8WUAPPFhLLACH6AssAyXGAGMjLBfhTzxZw+gLLasyCCA9CQHD7AsmDBvsA4w5/+GLbPBMcAvrbPPhOQFTwAyDCAI4rcCCAEMjLBVAHzxYi+gIWy2oVyx+L9NYXJrZXRwbGFjZSBmZWWM8WyXL7AJE04vhOQAPwAyDCAI4jcCCAEMjLBVAEzxYi+gITy2oSyx+LdSb3lhbHR5jPFsly+wCRMeKCCA9CQHD7AvhOWKEBoSDCABoUAMCOInAggBDIywX4Us8WUAP6AhLLassfi2UHJvZml0jPFsly+wCRMOJwIPglghBfzD0UyMsfyz/4Tc8WUAPPFhLLAIIImJaA+gLLAMlxgBjIywX4U88WcPoCy2rMyYMG+wAC8vhOwQGRW+D4TvhHoSKCCJiWgKFSELyZMAGCCJiWgKEBkTLijQpWW91ciBiaWQgaGFzIGJlZW4gb3V0YmlkIGJ5IGFub3RoZXIgdXNlci6ABwP+OHzCNBtBdWN0aW9uIGhhcyBiZWVuIGNhbmNlbGxlZC6DeIcIA4w8WFwA4cCCAGMjLBfhNzxZQBPoCE8tqEssfAc8WyXL7AAACWwARIIQO5rKAKmEgAB0IMAAk18DcOBZ8AIB8AGAAIPhI0PpA0x/TH/pA0x/THzAAyvhBbt3tRNDSAAH4YtIAAfhk0gAB+Gb6QAH4bfoAAfhu0x8B+G/THwH4cPpAAfhy1AH4aNQw+Gn4SdDSHwH4Z/pAAfhj+gAB+Gr6AAH4a/oAAfhs0x8B+HH6QAH4c9MfMPhlf/hhAFT4SfhI+FD4T/hG+ET4QsjKAMoAygD4Tc8W+E76Assfyx/4Us8WzMzJ7VQBqlR8', 'base64'))[0]

    /**
     * Builds the data cell for the auction contract.
     * @param data - The data for building the data cell.
     * @returns The built data cell.
     */
    static buildDataCell(data: NftAuctionV2Data) {

        const constantCell = beginCell()
        const subGasPriceFromBid = 8449000
        constantCell.storeUint(subGasPriceFromBid, 32)
        constantCell.storeAddress(data.marketplaceAddress)
        constantCell.storeCoins(data.minBid)
        constantCell.storeCoins(data.maxBid)
        constantCell.storeCoins(data.minStep)
        constantCell.storeUint(data.stepTimeSeconds, 32) // step_time
        constantCell.storeAddress(data.nftAddress)
        constantCell.storeUint(data.createdAtTimestamp, 32)

        const feesCell = beginCell()
        feesCell.storeAddress(data.marketplaceFeeAddress)      // mp_fee_addr
        feesCell.storeUint(data.marketplaceFeeFactor, 32)               // mp_fee_factor
        feesCell.storeUint(data.marketplaceFeeBase, 32)   // mp_fee_base
        feesCell.storeAddress(data.royaltyAddress)  // royalty_fee_addr
        feesCell.storeUint(data.royaltyFactor, 32)              // royalty_fee_factor
        feesCell.storeUint(data.royaltyBase, 32)   // royalty_fee_base


        const storage = beginCell()
        storage.storeBit(data.end) // end?
        storage.storeBit(data.activated) // activated
        storage.storeBit(false) // is_canceled
        storage.storeBuffer(Buffer.from([0, 0]))        // last_member
        storage.storeCoins(0)       // last_bid
        storage.storeUint(0, 32) // last_bid_at
        storage.storeUint(data.endTimestamp, 32)    // end_time
        if (data.nftOwnerAddress) {
            storage.storeAddress(data.nftOwnerAddress)
        } else {
            storage.storeBuffer(Buffer.from([0, 0]))
        }
        storage.storeRef(feesCell.endCell())
        storage.storeRef(constantCell.endCell())

        return storage.endCell()
    }

    /**
     * Creates an `NftAuctionV2` instance from an address.
     * @param address - The address to create from.
     * @returns A new `NftAuctionV2` instance.
     */
    static createFromAddress(
        address: Address,
    ) {
        return new NftAuctionV2(
            address
        )
    }

    /**
     * Creates an `NftAuctionV2` instance from configuration data.
     * @param config - The configuration data for creating the instance.
     * @param workchain - The workchain ID (default: 0).
     * @returns A new `NftAuctionV2` instance.
     */
    static createFromConfig(
        config: NftAuctionV2Data,
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

        return new NftAuctionV2(
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
     * Sends a cancel command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the cancel command.
     * @param params - The parameters for the cancel command.
     */
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
    
    /**
     * Sends a stop command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the stop command.
     * @param params - The parameters for the stop command.
     */
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

    /**
     * Retrieves the sale data from the contract.
     * @param provider - The contract provider.
     * @returns The sale data.
     */
    async getSaleData(provider: ContractProvider) {
        const { stack } = await provider.get('get_sale_data', [])

        // pops out saleType
        stack.pop()

        return {
            end: stack.readBigNumber(),
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

/**
 * Type representing the data for an NFT auction contract version 2.
 */
export type NftAuctionV2Data = {
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