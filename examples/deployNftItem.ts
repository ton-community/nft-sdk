import {toNano} from 'ton-core'
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
    const collectionAddress = randomAddress()

    // Deploying Assets
    const pinata = new Pinata('<apiKey>', '<secretApiKey>')
    const data: [string[], string[]] = await pinata.uploadBulk('./assets')

    // Creates NFT Item
    const nftItem = client.open(
        await NftItem.createFromConfig({
            index: 1,
            ownerAddress: ownerAddress,
            collectionAddress: collectionAddress,
            content: data[1][0]
        })
    )

    // Deploys Nft Item
    const deployResult = await nftItem.sendDeploy(wallet, toNano('0.05'))

    // Prints Result
    console.log(deployResult)

    // Fetches Nft Data
    const nftData = await nftItem.getNftData()

    // Prints Nft Data
    console.log(nftData)    
}

main()