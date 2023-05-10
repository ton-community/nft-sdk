import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftCollection, NftCollectionData} from '../../src/wrappers/getgems/NftCollection/NftCollection'
import {randomAddress} from "../../src/utils/randomAddress";


async function main() {
    // Creates Local Test Blockchain
    const blockchain = await Blockchain.create()

    const ROYALTY_ADDRESS = randomAddress()
    
    // Gets a deployer
    const deployer = await blockchain.treasury('deployer')

    const defaultConfig: NftCollectionData = {
        ownerAddress: deployer.address,
        nextItemIndex: 777,
        collectionContent: 'collection_content',
        commonContent: 'common_content',
        nftItemCode: new Cell(),
        royaltyParams: {
            royaltyFactor: 100,
            royaltyBase: 200,
            royaltyAddress: ROYALTY_ADDRESS
        }
    }
    

    // Creates NFT Collection
    const nftCollection = blockchain.openContract(
        await NftCollection.createFromConfig(defaultConfig)
    )
    
    // Deploys Nft Item
    const deployResult = await nftCollection.sendDeploy(deployer.getSender(), toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    let itemIndex = 1

    let res = await nftCollection.sendMint(deployer.getSender(), {
        value: toNano('1'),
        passAmount: toNano('0.5'),
        itemIndex,
        itemOwnerAddress: deployer.address,
        itemContent: 'test_content'
    })

    console.log(res)
}

main();