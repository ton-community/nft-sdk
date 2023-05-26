import {TonNftClient} from '../src/ton-api'

async function main() {
    const tonClient = new TonNftClient('tonapi')

    // Telegram Number Collection
    const collection = await tonClient.getNftCollectionByAddress('EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N')

    // Prints the Collection Data
    console.log(collection)

    // NFT Collections
    const collections = await tonClient.getNftCollections(
        10,
        10
    )

    // Prints the Collection Data
    console.log(collections)

    // Get NFT items from collection by collection address
    const items = await tonClient.getNftItemsFromCollectionByAddress('EQAOQdwdw8kGftJCSFgOErM1mBjYPe4DBPq8-AhF6vr9si5N',10,10)

    // Prints the Collection Data
    console.log(items)

    // Get NFT item by its address
    const item = await tonClient.getNftItemByAddress('EQBn9d_1SaXIqogjb884eIDlbA3_4lgVv1rl8GyTpQpp_1Oi')

    // Prints the Collection Data
    console.log(item)
}

main()
