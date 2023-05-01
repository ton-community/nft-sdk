import {Blockchain} from '@ton-community/sandbox'
import {beginCell, Cell, contractAddress, SendMode, toNano} from 'ton-core'
import {SbtSingle, SbtSingleSource} from '../../src/wrappers/getgems/SbtSingle'
import {randomAddress} from "../../src/utils/randomAddress";
import { compileFunc } from '@ton-community/func-js';

function commentBody(comment: string) {
    return beginCell()
        .storeUint(0, 32)
        .storeStringTail(comment)
        .endCell()
}

async function main() {
    const blockchain = await Blockchain.create()

    let code = await compileFunc(
        {
            "sources": [{
                "filename": "sbt-single.fc",
                "content": SbtSingleSource
            }]
        }
    );

    console.log(code)

    // let ownerAddress = randomAddress()
    // let editorAddress = randomAddress()

    // let address = contractAddress(0, init);

    // const nftItem = blockchain.openContract(
    //     NftItem.createFromAddress({
    //         ownerAddress: ownerAddress,
    //         editorAddress: editorAddress,
    //         content: ""
    //     })
    // )

    // const deployer = await blockchain.treasury('deployer')

    // const deployResult = await nftItem.sendDeploy(deployer.getSender(), toNano('0.05'))

    // console.log(deployResult);

    // const nftData = await nftItem.getNftData()

    // console.log(nftData);
}

main();