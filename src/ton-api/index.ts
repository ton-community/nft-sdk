import { Address } from 'ton-core'

export class TonNftClient {
    constructor(
        readonly client: ClientInterface
    ) {}

    async getNftCollections(
        limit?: number,
        offset?: number,
    ) {
        return await this.client.getNftCollections(limit, offset)
    }

    async getNftCollection(
        collectionAddress: string,
    ) {
        return await this.client.getNftCollection(collectionAddress)
    }

    async getNftItems(
        collectionAddress: string,
        limit?: number,
        offset?: number,
    ) {
        return await this.client.getNftItems(collectionAddress, limit, offset)
    }

    async getNftItem(
        itemAddress: string,
    ) {
        return await this.client.getNftItem(itemAddress)
    }

    async getTransactionsByAddress(
        address: Address,
        limit?: number
    ) {
        return await this.client.getTransactionsByAddress(address, limit)
    }
}

export interface ClientInterface {
    getNftCollections: (limit?: number, offset?: number) => Promise<unknown>
    getNftCollection: (collectionAddress: string) => Promise<unknown>
    getNftItems: (collectionAddress: string, limit?: number, offset?: number) => Promise<unknown>
    getNftItem: (itemAddress: string) => Promise<unknown>
    getTransactionsByAddress: (address: Address, limit?: number) => Promise<unknown>
}