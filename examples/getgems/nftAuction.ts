import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftAuction, NftAuctionData} from '../../src/wrappers/getgems/NftAuction/NftAuction'
import {randomAddress} from "../../src/utils/randomAddress";
import {importKeyPair} from "../../src/utils/importKeyPair"
import {createSender} from "../../src/utils/createSender"
import {ENDPOINT} from "../../src"
import { TonClient4 } from 'ton';
import { writeFileSync } from 'fs';

async function main() {
    // Config
    let keypair = await importKeyPair("");
    let client = new TonClient4({endpoint: ENDPOINT.TESTNET})
    let wallet = await createSender(keypair, client)

    let config: NftAuctionData = {
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

    const nftAuction = client.open(
        await NftAuction.createFromConfig(
            config
        )
    );

    await nftAuction.sendDeploy(wallet, toNano('0.05'));

    console.log(
        `NFT Auction deployed at ${nftAuction.address}`
    )

    await writeFileSync(
        './nftAuction.json',
        JSON.stringify({
            config: config,
            address: nftAuction.address,
            init: nftAuction.init
        }
    ))
    
    console.log(
        `Saved Config`
    )

    // Fetches Nft Data
    const data = await nftAuction.getSaleData()

    // Prints Nft Data
    console.log(data);
}

main();