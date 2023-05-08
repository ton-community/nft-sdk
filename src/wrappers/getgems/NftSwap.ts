import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode } from 'ton-core'

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

export class NftSwap implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(
        address: Address
    ) {
        return new NftSwap(
            address
        )
    }

    // Deployment
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            body: beginCell().endCell(),
        })
    }


    async sendOwnershipAssigned(provider: ContractProvider, via: Sender, params: { 
        value: bigint, 
        queryId?: number,
        prevOwner: Address
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.ownershipAssigned, 32)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.prevOwner)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

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

    async sendTransferCommission(provider: ContractProvider, via: Sender, params: {
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.transferCommission, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendTransferCancel(provider: ContractProvider, via: Sender, params: {
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.transferCancel, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendTransferComplete(provider: ContractProvider, via: Sender, params: {
        value: bigint,
        queryId?: number
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.transferComplete, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

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
    
    async sendMakeMessage(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint,
            queryId?: number,
            to: Address,
            amount: bigint,
            body: Cell
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x18, 6)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.to)
                .storeCoins(params.amount)
                .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 +1)
                .storeRef(params.body)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async getTradeState(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('get_trade_state', [])
        return {
            state: stack.readBigNumber() ?? 0, 
            left_ok: !(stack.readBigNumber().toString() == "0"), 
            right_ok: !(stack.readBigNumber().toString() == "0"), 
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

    async getSupervisor(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('get_supervisor', [])
        return {
            supervisor: stack.readAddressOpt()
        }
    }

    
}