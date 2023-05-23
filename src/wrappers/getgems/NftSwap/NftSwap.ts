import { Address, beginCell, Cell, Contract, ContractProvider, Dictionary, Sender, SendMode, contractAddress } from 'ton-core'

/**
 * OperationCodes are identifiers for various actions that can be performed by the contract.
 */
const OperationCodes = {
    ownershipAssigned: 0x05138d91,
    addCoins: 1,
    cancel: 2,
    maintain: 3,
    topup: 4,
    transferCommission: 0x82bd8f2a,
    transferCancel: 0xb5188860,
    transferComplete: 0xef03d009,
}

/**
 * SwapState represents the different states of a swap.
 */
export const SwapState = {
    Active: 1,
    Cancelled: 2,
    Completed: 3,
}

/**
 * Interface representing an NFT item, containing an address and whether it has been sent.
 */
interface NFTItem {
    addr: Address
    sent: boolean
}

/**
 * SwapData represents the information of a swap operation.
 */
export type SwapData = {
    state: number,
    leftAddress: Address
    rightAddress: Address
    rightNft: NFTItem[]
    leftNft: NFTItem[]
    supervisorAddress: Address
    commissionAddress: Address
    leftCommission: bigint
    leftAmount: bigint
    leftCoinsGot: bigint
    rightCommission: bigint
    rightAmount: bigint
    rightCoinsGot: bigint
}

/**
 * Class representing an NFT Swap, implementing the Contract interface.
 */
export class NftSwap implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static code = Cell.fromBoc(Buffer.from('te6cckECDAEAAqAAART/APSkE/S88sgLAQIBIAMCAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vACAUgFBABXoDhZ2omhpgGmP/SB9IH0gfQBqaYAYGGh9IH0AfSB9ABhBCCMkrCgFYACqwECAs0IBgH3ZghA7msoAUmCgUjC+8uHCJND6QPoA+kD6ADBTkqEhoVCHoRagUpBwgBDIywVQA88WAfoCy2rJcfsAJcIAJddJwgKwjhdQRXCAEMjLBVADzxYB+gLLaslx+wAQI5I0NOJacIAQyMsFUAPPFgH6AstqyXH7AHAgghBfzD0UgcAlsjLHxPLPyPPFlADzxbKAIIJycOA+gLKAMlxgBjIywUmzxZw+gLLaszJgwb7AHFVUHAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVAP10A6GmBgLjYSS+CcH0gGHaiaGmAaY/9IH0gfSB9AGppgBgYOCmE44BgAEwthGmP6Z+lVW8Q4AHxgRDAgRXdFOAA2CnT44LYTwhWL4ZqGGhpg+oYAP2AcBRgAPloyhJrpOEBWfGBHByUYABOGxuIHCOyiiGYOHgC8BRgAMCwoJAC6SXwvgCMACmFVEECQQI/AF4F8KhA/y8ACAMDM5OVNSxwWSXwngUVHHBfLh9IIQBRONkRW68uH1BPpAMEBmBXAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVADYMTc4OYIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxXLPyfPFifPFhTKACP6AhPKAMmAQPsAcVBmRRUEcAfIywAWyx9QBM8WWM8WAc8WAfoCzMsAye1UM/Vflw==', 'base64'))[0]

    static buildDataCell(data: SwapData) {
        const dataCell = beginCell()
        dataCell.storeUint(data.state, 2)
        dataCell.storeAddress(data.leftAddress)
        dataCell.storeAddress(data.rightAddress)

        dataCell.storeCoins(data.leftCommission)
        dataCell.storeCoins(data.leftAmount)
        dataCell.storeCoins(data.leftCoinsGot)
        dataCell.storeBit(data.leftNft.length > 0)

        if (data.leftNft.length > 0) {
            const leftNft = Dictionary.empty(
                Dictionary.Keys.BigUint(256)
            )
            
            for (const leftNftKey in data.leftNft) {
                const bitCell = beginCell()
                bitCell.storeBit(data.leftNft[leftNftKey].sent)

                leftNft.store(bitCell)
            }
            dataCell.storeDict(leftNft)
        }

        dataCell.storeCoins(data.rightCommission)
        dataCell.storeCoins(data.rightAmount)
        dataCell.storeCoins(data.rightCoinsGot)
        dataCell.storeBit(data.rightNft.length > 0)

        if (data.rightNft.length > 0) {
            const rightNft = Dictionary.empty(
                Dictionary.Keys.BigUint(256)
            )
            
            for (const rightNftKey in data.rightNft) {
                const bitCell = beginCell()
                bitCell.storeBit(data.rightNft[rightNftKey].sent)

                rightNft.store(bitCell)
            }
            dataCell.storeDict(rightNft)
        }

        const marketCell = beginCell()
        marketCell.storeAddress(data.commissionAddress)
        marketCell.storeAddress(data.supervisorAddress)
        dataCell.storeRef(marketCell)
    
        return dataCell.endCell()
    }

    /**
     * Method to create a new NftSwap instance from an address.
     * @param address - The address of the swap.
     */
    static createFromAddress(
        address: Address
    ) {
        return new NftSwap(
            address
        )
    }

    /**
     * Method to create a new NftSwap instance from a configuration.
     * @param config - The configuration of the swap.
     * @param workchain - The workchain of the swap.
     */
    static async createFromConfig(
        config: SwapData,
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

        return new NftSwap(
            address,
            {
                code: this.code,
                data: data
            }
        )
    }

    /**
     * Method to send a deploy command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the deploy command.
     * @param value - The value sent with the deploy command.
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
     * @param params - Parameters for the cancel command including value and optional queryId.
     */
    async sendCancel(provider: ContractProvider, via: Sender, params: { 
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.cancel, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Sends an addCoins command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the addCoins command.
     * @param params - Parameters for the addCoins command including value, optional queryId, and coins.
     */
    async sendAddCoins(provider: ContractProvider, via: Sender, params: { 
        value: bigint,
        queryId?: number,
        coins: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.addCoins, 32)
                .storeUint(params.queryId || 0, 64)
                .storeCoins(params.coins)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Sends a maintain command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the maintain command.
     * @param params - Parameters for the maintain command including value, optional queryId, mode, and msg.
     */
    async sendMaintain(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint,
            queryId?: number,
            mode: number,
            msg: Cell
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.maintain, 32)
                .storeUint(params.queryId || 0, 64)
                .storeUint(params.mode, 8)
                .storeRef(params.msg)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Sends a topup command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the topup command.
     * @param params - Parameters for the topup command including value and optional queryId.
     */
    async sendTopup(provider: ContractProvider, via: Sender, params: { 
        value: bigint,
        queryId?: number 
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.topup, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Gets the current state of the trade from the contract.
     * @param provider - The contract provider.
     * @returns An object representing the current state of the trade.
     */
    async getTradeState(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('get_trade_state', [])
        return {
            state: stack.readBigNumber() ?? 0, 
            left_ok: !(stack.readBigNumber().toString() == '0'), 
            right_ok: !(stack.readBigNumber().toString() == '0'), 
            leftAddress: stack.readAddressOpt(), 
            rightAddress: stack.readAddressOpt(), 
            leftNft: stack.readCell(), 
            rightNft: stack.readCell(),
            leftComm: stack.readBigNumber(), 
            leftAmount: stack.readBigNumber(), 
            leftGot: stack.readBigNumber(), 
            rightComm: stack.readBigNumber(), 
            rightAmount: stack.readBigNumber(), 
            rightGot: stack.readBigNumber()
        }
    }

    /**
     * Gets the supervisor of the contract.
     * @param provider - The contract provider.
     * @returns An object representing the supervisor.
     */
    async getSupervisor(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('get_supervisor', [])
        return {
            supervisor: stack.readAddressOpt()
        }
    }   
}