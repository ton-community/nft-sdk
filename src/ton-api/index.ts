export class TonAPI {
    private url: string;

    constructor(url?: string) {
        this.url = url ? url : "https://tonapi.io";
    }

    // Get NFT collections - /v2/nfts/collections
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
        );

        return response;
    }

    // Get NFT collection by collection address - /v2/nfts/collections/{account_id}
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
        );

        return response;
    }

    // Get NFT items from collection by collection address - /v2/nfts/collections/{account_id}/items
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
        );

        return response;
    }

    // Get NFT item by its address - /v2/nfts/{account_id}
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
        );

        return response;
    }
}

async function request<TResponse>(
    url: string, 
    config: RequestInit
  ): Promise<TResponse> {
    const response = await fetch(url, config);
    return await response.json();
  }