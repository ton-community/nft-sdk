import { Address } from 'ton-core'
import {TonAPI} from './TonAPI'

export class TonNftClient {
    constructor(
        readonly provider: string,
        readonly url?: string
    ) {}

    async getNftCollections(
        limit?: number,
        offset?: number,
    ) {
        if (this.provider === 'tonapi') {
            const tonApi = new TonAPI()

            return await tonApi.getNftCollections(limit, offset)
        }
    }

    async getNftCollectionByAddress(
        collectionAddress: string,
    ) {
        if (this.provider === 'tonapi') {
            const tonApi = new TonAPI()

            return await tonApi.getNftCollectionByAddress(collectionAddress)
        }
    }

    async getNftItemsFromCollectionByAddress(
        collectionAddress: string,
        limit?: number,
        offset?: number,
    ) {
        if (this.provider === 'tonapi') {
            const tonApi = new TonAPI()

            return await tonApi.getNftItemsFromCollectionByAddress(collectionAddress, limit, offset)
        }
    }

    async getNftItemByAddress(
        itemAddress: string,
    ) {
        if (this.provider === 'tonapi') {
            const tonApi = new TonAPI()

            return await tonApi.getNftItemByAddress(itemAddress)
        }
    }

    async getTransactionsByAddress(
        address: Address,
        limit: number
    ) {
        if (this.provider === 'tonapi') {
            const tonApi = new TonAPI()

            return await tonApi.getTransactionsByAddress(address, limit)
        }
    }
}