import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftItem} from '../../wrappers/getgems/NftItem'
import {randomAddress} from "../../utils/randomAddress";
import { compileFunc } from '@ton-community/func-js';

function commentBody(comment: string) {
    return beginCell()
        .storeUint(0, 32)
        .storeStringTail(comment)
        .endCell()
}

async function main() {
    // Creates Local Test Blockchain
    const blockchain = await Blockchain.create()

    // Generates Random Addresses
    let ownerAddress = randomAddress()
    let collectionAddress = randomAddress()

    // Creates NFT Item
    const nftItem = blockchain.openContract(
        await NftItem.createFromConfig({
            index: 1,
            ownerAddress: ownerAddress,
            collectionAddress: collectionAddress,
            content: ""
        })
    )
    
    // Gets a deployer
    const deployer = await blockchain.treasury('deployer')

    // Deploys Nft Item
    const deployResult = await nftItem.sendDeploy(deployer.getSender(), toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Fetches Nft Data
    const nftData = await nftItem.getNftData()

    // Prints Nft Data
    console.log(nftData);
}

main();