import { Address, Transaction } from 'ton-core'

/**
 * Class representing a TON API client.
 */
export class TonAPI {
    private url: string

    /**
     * Create a new TON API client.
     * @param {string} [url] - The base URL for the TON API. Default is 'https://tonapi.io'.
     */
    constructor(url?: string) {
        this.url = url ? url : 'https://tonapi.io'
    }

    /**
     * Fetch NFT collections.
     * @param {number} [limit] - The maximum number of collections to fetch.
     * @param {number} [offset] - The offset to start fetching from.
     */
    async getNftCollections(
        limit?: number,
        offset?: number,
    ) {
        const response = await request(
            `${this.url}/v2/nfts/collections?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        return response
    }

    /**
     * Fetch an NFT collection by its address.
     * @param {string} collectionAddress - The address of the collection to fetch.
     */
    async getNftCollectionByAddress(
        collectionAddress: string,
    ) {
        const response = await request(
            `${this.url}/v2/nfts/collections/${collectionAddress}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        return response
    }

    /**
     * Fetch NFT items from a collection by the collection's address.
     * @param {string} collectionAddress - The address of the collection to fetch items from.
     * @param {number} [limit] - The maximum number of items to fetch.
     * @param {number} [offset] - The offset to start fetching from.
     */
    async getNftItemsFromCollectionByAddress(
        collectionAddress: string,
        limit?: number,
        offset?: number,
    ) {
        const response = await request(
            `${this.url}/v2/nfts/collections/${collectionAddress}/items?limit=${limit}&offset=${offset}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        return response
    }

    /**
     * Fetch an NFT item by its address.
     * @param {string} itemAddress - The address of the item to fetch.
     */
    async getNftItemByAddress(
        itemAddress: string,
    ) {
        const response = await request(
            `${this.url}/v2/nfts/${itemAddress}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        return response
    }

    /**
     * Fetch transactions by address.
     * @param {Address} address - The address to fetch transactions for.
     * @param {number} limit - The maximum number of transactions to fetch.
     * @returns {Promise<any>} A promise resolving with the fetched transactions.
     */
    async getTransactionsByAddress(
        address: Address,
        limit: number,
        // maxLt?: number,
        // minLt?: number
    ) {
        const response = await request(
            `${this.url}/v1/blockchain/getTransactions?account=${address.toString()}&limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        return response
    }

    /**
     * Fetch transaction data.
     * @param {string} transactionId - The ID of the transaction to fetch data for.
     * @returns {Promise<Transaction>} A promise resolving with the fetched transaction data.
     */
    async getTransactionData(
        transactionId: string
    ): Promise<Transaction> {
        const response: Transaction = await request(
            `${this.url}/v2/blockchain/transactions/${transactionId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        return response
    }
}

/**
 * Send a request to a URL and return the response as JSON.
 * @template TResponse The expected shape of the response body.
 * @param {string} url - The URL to send the request to.
 * @param {RequestInit} config - The configuration options for the request.
 * @returns {Promise<TResponse>} A promise resolving with the response body.
 */
async function request<TResponse>(
    url: string, 
    config: RequestInit
): Promise<TResponse> {
    const response = await fetch(url, config)
    return (await response.json()) as TResponse
}