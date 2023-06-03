import {toNano} from 'ton-core'
import {NftCollection} from '../src/wrappers/getgems/NftCollection/NftCollection'
import {randomAddress, importKeyPair, createSender} from '../src/utils'
import {ENDPOINT} from '../src'
import { TonClient4 } from 'ton'
import { Pinata } from '../src'

async function main() {
    // Config
    const keypair = await importKeyPair('')
    const client = new TonClient4({endpoint: ENDPOINT.TESTNET})
    const wallet = await createSender(keypair, client)
    const address = wallet.address ?? randomAddress()

    // Addresses
    const ownerAddress = address
    const collectionAddress = randomAddress()

    // Deploying Assets
    const pinata = new Pinata('<apiKey>', '<secretApiKey>')
    const data: [string[], string[]] = await pinata.uploadBulk('./assets')

    // Creates NFT Item
    const nftCollection = client.open(
        await NftCollection.createFromAddress(
            collectionAddress
        )
    )

    // Mints NFT
    const mintResult = await nftCollection.sendMint(
        wallet,
        {
            queryId: 1,
            value: toNano(1),
            passAmount: toNano(1),
            itemIndex: 0,
            itemOwnerAddress: ownerAddress,
            itemContent: data[1][0]
        }
    )

    // Prints Result
    console.log(mintResult)

    // Fetches Nft Data
    const collectionData = await nftCollection.getCollectionData()

    // Prints Nft Data
    console.log(collectionData)    
}

main()