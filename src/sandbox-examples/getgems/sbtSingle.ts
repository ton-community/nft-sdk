import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {SbtSingle} from '../../wrappers/getgems/SbtSingle'
import {randomAddress} from "../../utils/randomAddress";
import {BN} from 'bn.js'

async function main() {
    // Creates Local Test Blockchain
    const blockchain = await Blockchain.create()

    // Gets a deployer
    const deployer = await blockchain.treasury('deployer')

    // Creates NFT Single
    const sbtSingle = blockchain.openContract(
        await SbtSingle.createFromConfig({
            ownerAddress: deployer.address,
            editorAddress: deployer.address,
            content: "",
            authorityAddress: deployer.address
        })
    )
    

    // Deploys Nft Item
    const deployResult = await sbtSingle.sendDeploy(deployer.getSender(), toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const nftData = await sbtSingle.getNftData()

    // Prints Nft Data
    console.log(nftData);
}

main();