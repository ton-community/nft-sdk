import {toNano} from 'ton-core'
import {NftItem} from '../src/wrappers/getgems/NftItem/NftItem'
import {randomAddress, importKeyPair, createSender} from '../src/utils'
import {ENDPOINT} from '../src'
import { TonClient4 } from 'ton'

async function main() {
    // Config
    const keypair = await importKeyPair('')
    const client = new TonClient4({endpoint: ENDPOINT.TESTNET})
    const wallet = await createSender(keypair, client)
    const address = wallet.address ?? randomAddress()

    // Addresses
    const ownerAddress = address
    const newOwner = randomAddress()
    const nft = randomAddress()

    // Creates NFT Item Instance
    const nftItem = client.open(
        await NftItem.createFromAddress(
            nft
        )
    )

    // Transfers Nft
    const result = await nftItem.sendTransfer(
        wallet,
        {
            value: toNano(1),
            queryId: BigInt(1),
            newOwner: newOwner,
            responseDestination: ownerAddress,
            forwardAmount: toNano(0)
        }
    )

    // Prints Result
    console.log(result)

    // Fetches Nft Data
    const nftData = await nftItem.getNftData()

    // Prints Nft Data
    console.log(nftData)    
}

main()