import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, Slice, contractAddress } from 'ton-core';
import { encodeOffChainContent } from '../../types/OffchainContent';

export class NftCollection implements Contract {
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
        config: NftCollectionData, code: Cell, workchain = 0
    ) {
        const data = buildNftCollectionDataCell(config)
        const init = { code, data }
        return new NftCollection(contractAddress(workchain, init), workchain, init)
    }

    static createFromAddress(
        address: Address,
        workchain: number,
        init: { 
            code: Cell; 
            data: Cell 
        }
    ) {
        return new NftCollection(
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

    // const { stack } = await provider.get('get_nft_address_by_index', [
    //     { type: 'int', value: index }
    // ])

    async getCollectionData(
        provider: ContractProvider, 
        next_item_index: bigint, 
        collection_content: Cell,
        owner_address: Slice
    ) {
        const { stack } = await provider.get('get_collection_data', [
            { type: 'int', value: next_item_index },
            { type: 'cell', cell: collection_content },
            { type: 'slice', cell: owner_address.asCell() }
        ])
        return {
            next_item_index: stack.readBigNumber(),
            collection_content: stack.readCellOpt(),
            owner_address: stack.readAddressOpt(),
        }
    }

    async getNftAddressByIndex(
        provider: ContractProvider,
        index: bigint
    ) {
        const { stack } = await provider.get('get_nft_address_by_index', [
            { type: 'int', value: index }
        ])
        return {
            nft_address: stack.readAddressOpt(),
        }
    }

    async getNftContent(
        provider: ContractProvider,
        index: bigint,
        individual_content: Cell
    ) {
        const { stack } = await provider.get('get_nft_content', [
            { type: 'int', value: index },
            { type: 'cell', cell: individual_content }
        ])
        return {
            full_content: stack.readCellOpt(),
        }
    }

}

// Utils

export type RoyaltyParams = {
    royaltyFactor: number
    royaltyBase: number
    royaltyAddress: Address
}

export type NftCollectionData = {
    ownerAddress: Address,
    nextItemIndex: number | bigint
    collectionContent: string
    commonContent: string
    nftItemCode: Cell
    royaltyParams: RoyaltyParams
}

// default#_ royalty_factor:uint16 royalty_base:uint16 royalty_address:MsgAddress = RoyaltyParams;
// storage#_ owner_address:MsgAddress next_item_index:uint64
//           ^[collection_content:^Cell common_content:^Cell]
//           nft_item_code:^Cell
//           royalty_params:^RoyaltyParams
//           = Storage;

export function buildNftCollectionDataCell(data: NftCollectionData) {
    let dataCell = beginCell()

    dataCell.storeAddress(data.ownerAddress)
    dataCell.storeUint(data.nextItemIndex, 64)

    let contentCell = beginCell()

    let collectionContent = encodeOffChainContent(data.collectionContent)

    let commonContent = beginCell()
    commonContent.storeBuffer(Buffer.from(data.commonContent))
    // commonContent.bits.writeString(data.commonContent)

    contentCell.storeRef(collectionContent)
    contentCell.storeRef(commonContent)
    dataCell.storeRef(contentCell)

    dataCell.storeRef(data.nftItemCode)

    let royaltyCell = beginCell()
    royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16)
    royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16)
    royaltyCell.storeAddress(data.royaltyParams.royaltyAddress)
    dataCell.storeRef(royaltyCell)

    return dataCell.endCell()
}