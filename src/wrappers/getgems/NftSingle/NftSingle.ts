import { Address, beginCell, Cell, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'
import { NftItemRoyalty } from '../../standard/NftItemRoyalty'
import { encodeOffChainContent } from '../../../types/Content'

export class NftSingle extends NftItemRoyalty {   
    // Data

    static code = Cell.fromBoc(Buffer.from('te6cckECFQEAAwoAART/APSkE/S88sgLAQIBYgcCAgEgBAMAI7x+f4ARgYuGRlgOS/uAFoICHAIBWAYFABG0Dp4AQgRr4HAAHbXa/gBNhjoaYfph/0gGEAICzgsIAgEgCgkAGzIUATPFljPFszMye1UgABU7UTQ+kD6QNTUMIAIBIA0MABE+kQwcLry4U2AEuQyIccAkl8D4NDTAwFxsJJfA+D6QPpAMfoAMXHXIfoAMfoAMPACBtMf0z+CEF/MPRRSMLqOhzIQRxA2QBXgghAvyyaiUjC64wKCEGk9OVBSMLrjAoIQHARBKlIwuoBMSEQ4BXI6HMhBHEDZAFeAxMjQ1NYIQGgudURK6n1ETxwXy4ZoB1NQwECPwA+BfBIQP8vAPAfZRNscF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY4+ghBRGkRjyFAKzxZQC88WcSRKFFRGsHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEFeUECo4W+IQAIICjjUm8AGCENUydtsQN0UAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwMzTiVQLwAwBUFl8GMwHQEoIQqMsArXCAEMjLBVAFzxYk+gIUy2oTyx/LPwHPFsmAQPsAAIYWXwZsInDIywHJcIIQi3cXNSHIy/8D0BPPFhOAQHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAfZRN8cF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIMIA8uGSIY4+ghAFE42RyFALzxZQC88WcSRLFFRGwHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEGeUECo5W+IUAIICjjUm8AGCENUydtsQN0YAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwNDTiVQLwA+GNLv4=', 'base64'))[0]

    static buildDataCell(data: NftSingleData) {
        const dataCell= beginCell()

        const contentCell = encodeOffChainContent(data.content)

        const royaltyCell = beginCell()
        royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16)
        royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16)
        royaltyCell.storeAddress(data.royaltyParams.royaltyAddress)

        dataCell.storeAddress(data.ownerAddress)
        dataCell.storeAddress(data.editorAddress)
        dataCell.storeRef(contentCell)
        dataCell.storeRef(royaltyCell)

        return dataCell.endCell()
    }

    static createFromAddress(
        address: Address
    ) {
        return new NftSingle(
            address
        )
    }

    static async createFromConfig(
        config: NftSingleData,
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

        return new NftSingle(
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

    async sendTransferEditorship(provider: ContractProvider, via: Sender, params: { 
        value: bigint, 
        queryId?: number,
        newEditor: Address, 
        responseTo: Address|null,
        forwardAmount?: bigint 
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x1c04412a, 32)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.newEditor)
                .storeAddress(params.responseTo)
                .storeBit(false)
                .storeCoins(params.forwardAmount || 0)
                .storeBit(false)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }
}

// Utils

export type RoyaltyParams = {
    // numerator
    royaltyFactor: number
    // denominator
    royaltyBase: number
    royaltyAddress: Address
}

export type NftSingleData = {
    ownerAddress: Address
    editorAddress: Address
    content: string
    royaltyParams: RoyaltyParams
}