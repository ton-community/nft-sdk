import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftItem} from '../../src/wrappers/getgems/NftItem'
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
    let address = wallet.address ?? randomAddress();

    // Addresses
    let ownerAddress = address
    let collectionAddress = randomAddress()

    // Creates NFT Item
    const nftItem = client.open(
        await NftItem.createFromConfig({
            index: 1,
            ownerAddress: ownerAddress,
            collectionAddress: collectionAddress,
            content: ""
        })
    )

    // Deploys Nft Item
    const deployResult = await nftItem.sendDeploy(wallet, toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const nftData = await nftItem.getNftData()

    // Prints Nft Data
    console.log(nftData);    
}

main();