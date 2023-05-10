import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {NftCollection, NftCollectionData} from '../../src/wrappers/getgems/NftCollection/NftCollection'
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

    const ROYALTY_ADDRESS = address;

    const defaultConfig: NftCollectionData = {
        ownerAddress: address,
        nextItemIndex: 0,
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
    const nftCollection = client.open(
        await NftCollection.createFromConfig(defaultConfig)
    )
    
    // Deploys Nft Item
    const deployResult = await nftCollection.sendDeploy(wallet, toNano('0.05'))

    // Prints Result
    console.log(deployResult);

    // Minting
    let itemIndex = 1

    let res = await nftCollection.sendMint(wallet, {
        value: toNano('1'),
        passAmount: toNano('0.5'),
        itemIndex,
        itemOwnerAddress: address,
        itemContent: 'test_content'
    })

    console.log(res)
}

main();