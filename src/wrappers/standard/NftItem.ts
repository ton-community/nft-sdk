import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress, storeStateInit, toNano } from 'ton-core';
import { combineFunc } from '../../utils/combineFunc';
import { encodeOffChainContent } from '../../types/OffchainContent';
import {compile} from "@ton-community/blueprint";
import { StateInit } from 'ton';

export class NftItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(
        address: Address
    ) {
        return new NftItem(
            address
            );
    }

    // Deployment
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            body: beginCell().endCell(),
        })
    }

    async sendTransfer(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
        newOwner: Address
        responseDestination: Address
        customPayload?: Cell
        forwardAmount: bigint
        forwardPayload?: Cell
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x5fcc3d14, 32)
                .storeUint(params.queryId, 64)
                .storeAddress(params.newOwner)
                .storeAddress(params.responseDestination)
                .storeMaybeRef(params.customPayload)
                .storeCoins(params.forwardAmount)
                .storeMaybeRef(params.forwardPayload)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    // Getter Functio

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
}

// Utils

export type NftItemData = {
    ownerAddress: Address
    editorAddress: Address
    content: string
}

export function buildNftItemDataCell(data: NftItemData) {
    let dataCell = beginCell()

    let contentCell = encodeOffChainContent(data.content)

    dataCell.storeAddress(data.ownerAddress)
    dataCell.storeAddress(data.editorAddress)
    dataCell.storeRef(contentCell)

    return dataCell.endCell()
}

export const NftItemSource = combineFunc(__dirname, [
    '../../sources/stdlib.fc',
    '../../sources/op-codes.fc',
    '../../sources/params.fc',
    '../../sources/nft-single.fc',
])

export const NftItemCodeBoc = 'te6ccgECFQEAAw4AART/APSkE/S88sgLAQIBYgIDAgLOBAUCASAREgIBIAYHAgEgDxAEvQyIccAkl8D4NDTAwFxsJJfA+D6QPpAMfoAMXHXIfoAMfoAMPACBtMf0z+CEF/MPRRSMLqOiTIQRxA2QBXbPOCCEC/LJqJSMLrjAoIQaT05UFIwuuMCghAcBEEqUjC6gCAkKCwARPpEMHC68uFNgAfZRN8cF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIMIA8uGSIY4+ghAFE42RyFALzxZQC88WcSRLFFRGwHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEGeUECo5W+IMAIYWXwZsInDIywHJcIIQi3cXNSHIy/8D0BPPFhOAQHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAFQWXwYzAdASghCoywCtcIAQyMsFUAXPFiT6AhTLahPLH8s/Ac8WyYBA+wABYI6JMhBHEDZAFds84DEyNDU1ghAaC51RErqfURPHBfLhmgHU1DAQI/AD4F8EhA/y8A0AggKONSbwAYIQ1TJ22xA3RgBtcXCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAkzA0NOJVAvADAfZRNscF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY4+ghBRGkRjyFAKzxZQC88WcSRKFFRGsHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEFeUECo4W+IOAIICjjUm8AGCENUydtsQN0UAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwMzTiVQLwAwAVO1E0PpA+kDU1DCAAGzIUATPFljPFszMye1UgAgFYExQAI7x+f4ARgYuGRlgOS/uAFoICHAAdtdr+AE2GOhph+mH/SAYQABG0Dp4AQgRr4HA='

export const NftItemCodeCell = Cell.fromBoc(Buffer.from(NftItemCodeBoc, 'base64'))[0]