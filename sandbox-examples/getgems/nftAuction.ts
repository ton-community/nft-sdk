import {Blockchain} from '@ton-community/sandbox'
import {toNano} from 'ton-core'
import {NftAuction, NftAuctionData} from '../../src/wrappers/getgems/NftAuction'
import {randomAddress} from '../../src/utils/randomAddress'

async function main() {
    // Creates Local Test Blockchain
    const blockchain = await Blockchain.create()

    const defaultConfig: NftAuctionData = {
        marketplaceFeeAddress: randomAddress(),
        marketplaceFeeFactor: BigInt(5),
        marketplaceFeeBase: BigInt(100),


        royaltyAddress: randomAddress(),
        royaltyFactor: BigInt(20),
        royaltyBase: BigInt(100),


        minBid: toNano('1'),
        maxBid: toNano('100'),
        minStep: toNano('1'),
        endTimestamp: 1655880000, // 22 June 2022 г., 6:40:00

        stepTimeSeconds: 60*5,
        tryStepTimeSeconds: 60*5,

        nftOwnerAddress: null,
        nftAddress: randomAddress(),

        end: true,
        marketplaceAddress: randomAddress(),
        activated: false,
        createdAtTimestamp: 1655880000-60*60,
    }

    // Creates NFT Auction
    const nftAuction = blockchain.openContract(
        await NftAuction.createFromConfig(defaultConfig)
    )
    
    // Gets a deployer
    const deployer = await blockchain.treasury('deployer')

    // Deploys Nft Item
    const deployResult = await nftAuction.sendDeploy(deployer.getSender(), toNano('0.05'))

    // Prints Result
    console.log(deployResult)

    // Fetches Nft Data
    const data = await nftAuction.getSaleData()

    // Prints Nft Data
    console.log(data)
}

main()