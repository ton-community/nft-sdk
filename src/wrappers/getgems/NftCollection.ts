import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, Slice, contractAddress } from 'ton-core';
import { serializeDict } from 'ton';
// BN
import BN from 'bn.js';

export type CollectionMintItemInput = {
    passAmount: bigint
    index: number
    ownerAddress: Address
    content: string
}

export type RoyaltyParams = {
    royaltyFactor: number
    royaltyBase: number
    royaltyAddress: Address
}

export const OperationCodes = {
    Mint: 1,
    BatchMint: 2,
    ChangeOwner: 3,
    EditContent: 4,
    GetRoyaltyParams: 0x693d3950,
    GetRoyaltyParamsResponse: 0xa8cb00ad
}

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

    async sendMint(provider: ContractProvider, via: Sender, params: { 
        queryId?: number, 
        value: bigint,
        passAmount: bigint, 
        itemIndex: number, 
        itemOwnerAddress: Address, 
        itemContent: string 
    }) {
        let itemContent = beginCell()
        // itemContent.bits.writeString(params.itemContent)
        itemContent.storeBuffer(Buffer.from(params.itemContent)).endCell()

        let nftItemMessage = beginCell()

        nftItemMessage.storeAddress(params.itemOwnerAddress)
        nftItemMessage.storeRef(itemContent).endCell()

        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(params.queryId || 0, 64)
                .storeUint(params.itemIndex, 64)
                .storeCoins(params.passAmount)
                .storeRef(nftItemMessage)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    async sendChangeOwner(provider: ContractProvider, via: Sender, params: { 
        queryId?: number, 
        value: bigint,
        newOwner: Address
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.ChangeOwner, 32)
                .storeUint(params.queryId || 0, 64)
                .storeAddress(params.newOwner)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY
        })
    }

    async sendRoyaltyParams(provider: ContractProvider, via: Sender, params: { 
        queryId?: number, 
        value: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(OperationCodes.GetRoyaltyParams, 32)
                .storeUint(params.queryId || 0, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY
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
