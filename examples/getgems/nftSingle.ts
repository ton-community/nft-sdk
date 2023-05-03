import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftSingle} from '../../src/wrappers/getgems/NftSingle'
import {randomAddress} from "../../src/utils/randomAddress";
import {importKeyPair} from "../../src/utils/importKeyPair"
import {createSender} from "../../src/utils/createSender"
import {ENDPOINT, Pinata} from "../../src"
import { TonClient4 } from 'ton';

async function main() {
    // Config
    let keypair = await importKeyPair("");
    let client = new TonClient4({endpoint: ENDPOINT.TESTNET})
    let wallet = await createSender(keypair, client)
    let address = wallet.address ?? randomAddress();

    // Deploying Assets
    let pinata = new Pinata('<apiKey>', '<secretApiKey>');
    let data: [string[], string[]] = await pinata.uploadBulk("./assets")

    // Creates NFT Single
    const nftSingle = client.open(
        await NftSingle.createFromConfig({
            ownerAddress: address,
            editorAddress: address,
            content: data[1][0],
            royaltyParams: {
                // ~10% Royalty
                royaltyFactor: 100,
                royaltyBase: 1000,
                royaltyAddress: address
            }
        })
    )

    // Deploys Nft Item
    const deployResult = await nftSingle.sendDeploy(wallet, toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const nftData = await nftSingle.getNftData()

    // Prints Nft Data
    console.log(nftData);
}

main();