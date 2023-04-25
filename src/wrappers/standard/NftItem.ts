import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress, storeStateInit, toNano } from 'ton-core';
import { compileFunc } from 'ton-compiler';
import { combineFunc } from '../../utils/combineFunc';
import { encodeOffChainContent } from '../../types/OffchainContent';
import {compile} from "@ton-community/blueprint";
import { StateInit } from 'ton';

export class NftItem implements Contract {
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

    static createFromConfig(
        config: NftItemData, code: Cell, workchain = 0
    ) {
        const data = buildNftItemDataCell(config)
        const init = { code, data }
        return new NftItem(contractAddress(workchain, init), workchain, init)
    }

    static createFromAddress(
        address: Address,
        workchain: number,
        init: { 
            code: Cell; 
            data: Cell 
        }
    ) {
        return new NftItem(
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


export async function buildNftItemStateInit(conf: NftItemData) {
    let dataCell = buildNftItemDataCell(conf)

    let code = await compileFunc(NftItemSource)

    let stateInit = storeStateInit({
        code: Cell.fromBoc(Buffer.from(code, 'base64'))[0],
        data: dataCell
    })

    return {
        stateInit: stateInit
    }
}


export const NftItemSource = combineFunc(__dirname, [
    '../../sources/stdlib.fc',
    '../../sources/op-codes.fc',
    '../../sources/params.fc',
    '../../sources/nft-item.fc',
])