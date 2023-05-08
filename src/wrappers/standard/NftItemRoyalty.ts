import { Address, beginCell, ContractProvider, Sender, SendMode } from 'ton-core'
import { NftItem } from './NftItem'

export class NftItemRoyalty extends NftItem {
    static createFromAddress(
        address: Address
    ) {
        return new NftItemRoyalty(
            address
        )
    }

    async sendGetRoyaltyParams(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint
            queryId: bigint
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x693d3950, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATLY,
        })
    }

    async getRoyaltyParams(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get('royalty_params', [])
        return {
            init: stack.readBoolean(),
            numerator: stack.readBigNumber(),
            denominator: stack.readBigNumber(),
            destination: stack.readAddressOpt()
        }
    }
}

