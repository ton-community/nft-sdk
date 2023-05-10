import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftSingle} from '../../src/wrappers/getgems/NftSingle/NftSingle'
import {randomAddress} from "../../src/utils/randomAddress";


async function main() {
    // Creates Local Test Blockchain
    const blockchain = await Blockchain.create()

    // Generates Random Addresses
    let ownerAddress = randomAddress()
    let editorAddress = randomAddress()

    let newOwnerAddress = randomAddress()

    // Creates NFT Single
    const nftSingle = blockchain.openContract(
        await NftSingle.createFromConfig({
            ownerAddress: ownerAddress,
            editorAddress: editorAddress,
            content: "",
            royaltyParams: {
                // ~10% Royalty
                royaltyFactor: 100,
                royaltyBase: 1000,
                royaltyAddress: ownerAddress
            }
        })
    )
    
    // Gets a deployer
    const deployer = await blockchain.treasury('deployer')

    // Deploys Nft Item
    const deployResult = await nftSingle.sendDeploy(deployer.getSender(), toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const nftData = await nftSingle.getNftData()

    // Prints Nft Data
    console.log(nftData);
}

main();