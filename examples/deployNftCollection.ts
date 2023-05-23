import {toNano} from 'ton-core'
import {NftCollection} from '../src/wrappers/getgems/NftCollection/NftCollection'
import {NftItem} from '../src/wrappers/getgems/NftItem/NftItem'
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

    // Deploying Assets
    const pinata = new Pinata('<apiKey>', '<secretApiKey>')
    const data: [string[], string[]] = await pinata.uploadBulk('./assets')

    // Creates NFT Collection
    const nftCollection = client.open(
        await NftCollection.createFromConfig({
            ownerAddress: ownerAddress,
            nextItemIndex: 1,
            collectionContent: data[1][0],
            commonContent: data[1][0],
            nftItemCode: NftItem.code,
            royaltyParams: {
                royaltyFactor: 10,
                royaltyBase: 100,
                royaltyAddress: ownerAddress
            }
        })
    )

    // Deploys Nft Collection
    const deployResult = await nftCollection.sendDeploy(wallet, toNano('0.05'))

    // Prints Result
    console.log(deployResult)

    // Fetches Nft Collection Data
    const collectionData = await nftCollection.getCollectionData()

    // Prints Nft Collection Data
    console.log(collectionData)    
}

main()