import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {SbtSingle} from '../../src/wrappers/getgems/SbtSingle/SbtSingle'
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

    // Creates NFT Single
    const sbtSingle = client.open(
        await SbtSingle.createFromConfig({
            ownerAddress: address,
            editorAddress: address,
            content: "",
            authorityAddress: address
        })
    )
    

    // Deploys Nft Item
    const deployResult = await sbtSingle.sendDeploy(wallet, toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const nftData = await sbtSingle.getNftData()

    // Prints Nft Data
    console.log(nftData);
}

main();