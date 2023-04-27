import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core';
import { encodeOffChainContent } from '../../types/OffchainContent';
import { combineFunc } from '../../utils/combineFunc';

export class SbtSingle implements Contract {
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
        return new SbtSingle(
            address,
            workchain,
            init
            );
    }


    // static async createFromConfig(
    //     config: SbtItemData
    // ) {

    //     let data = buildSbtItemDataCell(config);
    //     let address = contractAddress(
    //         0,
    //         {
    //             code: SbtItemCodeCell,
    //             data: data
    //         }
    //     )

    //     return new SbtItem(
    //         address,
    //         0,
    //         {
    //             code: SbtItemCodeCell,
    //             data: data
    //         }
    //     )
    // }
    

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

// Utils


export type SbtSingleData = {
    ownerAddress: Address
    editorAddress: Address
    content: string
    authorityAddress: Address
    revokedAt?: number
}

export function buildSingleSbtDataCell(data: SbtSingleData) {
    let dataCell = beginCell()

    let contentCell = encodeOffChainContent(data.content)

    dataCell.storeAddress(data.ownerAddress)
    dataCell.storeAddress(data.editorAddress)
    dataCell.storeRef(contentCell)
    dataCell.storeAddress(data.authorityAddress)
    dataCell.storeUint(data.revokedAt ? data.revokedAt : 0, 64)

    return dataCell.endCell()
}

// Data

export const SbtSingleSource = combineFunc(__dirname, [
    '../sources/stdlib.fc',
    '../sources/op-codes.fc',
    '../sources/params.fc',
    '../sources/sbt-single.fc',
])