import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, Slice } from 'ton-core';

export class SbtItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new SbtItem(address);
    }

    async sendProveOwnership(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
        dest: Address
        forwardPayload?: Cell
        withContent: boolean
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x04ded148, 32)
                .storeUint(params.queryId, 64)
                .storeAddress(params.dest)
                .storeMaybeRef(params.forwardPayload)
                .storeBit(params.withContent)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendRequestOwner(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
        dest: Address
        forwardPayload?: Cell
        withContent: boolean
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0xd0c3bfea, 32)
                .storeUint(params.queryId, 64)
                .storeAddress(params.dest)
                .storeMaybeRef(params.forwardPayload)
                .storeBit(params.withContent)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendRevoke(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x6f89f5e3, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async getNftData(provider: ContractProvider) {
        const { stack } = await provider.get('get_nft_data', [])
        return {
            init: stack.readBoolean(),
            index: stack.readBigNumber(),
            collectionAddress: stack.readAddressOpt(),
            ownerAddress: stack.readAddressOpt(),
            individualContent: stack.readCellOpt(),
        }
    }

    async getAuthorityAddress(provider: ContractProvider) {
        const { stack } = await provider.get('get_authority_address', [])
        return {
            authorityAddress: stack.readAddressOpt(),
        }
    }


    async getRevokedTime(provider: ContractProvider) {
        const { stack } = await provider.get('get_revoked_time', [])
        return {
            revoked_time: stack.readBigNumber(),
        }
    }
}
