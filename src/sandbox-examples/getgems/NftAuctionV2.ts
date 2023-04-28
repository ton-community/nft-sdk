import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftAuctionV2, NftAuctionV2Data} from '../../wrappers/getgems/NftAuctionV2'
import {randomAddress} from "../../utils/randomAddress";
import {BN} from 'bn.js'

async function main() {
    // Creates Local Test Blockchain
    const blockchain = await Blockchain.create()

    let defaultConfig: NftAuctionV2Data = {
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
    const nftAuctionV2 = blockchain.openContract(
        await NftAuctionV2.createFromConfig(defaultConfig)
    )
    
    // Gets a deployer
    const deployer = await blockchain.treasury('deployer')

    // Deploys Nft Item
    const deployResult = await nftAuctionV2.sendDeploy(deployer.getSender(), toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const data = await nftAuctionV2.getSaleData()

    // Prints Nft Data
    console.log(data);
}

main();