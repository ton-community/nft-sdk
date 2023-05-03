import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftAuctionV2, NftAuctionV2Data} from '../../src/wrappers/getgems/NftAuctionV2'
import {randomAddress} from "../../src/utils/randomAddress";
import {importKeyPair} from "../../src/utils/importKeyPair"
import {createSender} from "../../src/utils/createSender"
import {ENDPOINT} from "../../src"
import { TonClient4 } from 'ton';

async function main() {
    // Config
    let keypair = await importKeyPair("");
    let client = new TonClient4({endpoint: ENDPOINT.TESTNET})
    let wallet = await createSender(keypair, client)

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
    const nftAuctionV2 = client.open(
        await NftAuctionV2.createFromConfig(defaultConfig)
    )

    // Deploy
    const deployResult = await nftAuctionV2.sendDeploy(wallet, toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const data = await nftAuctionV2.getSaleData()

    // Prints Nft Data
    console.log(data);
}

main();