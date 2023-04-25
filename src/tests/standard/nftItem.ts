// import {Blockchain} from '@ton-community/sandbox'
// import {beginCell, Cell, SendMode, toNano} from 'ton-core'
// import {NftItem, NftItemSource} from '../../wrappers/standard/NftItem'
// import {compileFunc} from 'ton-compiler';
// import {randomAddress} from "../../utils/randomAddress";

// function commentBody(comment: string) {
//     return beginCell()
//         .storeUint(0, 32)
//         .storeStringTail(comment)
//         .endCell()
// }

// async function main() {
//     let code: Cell

//     code = "";

//     const blockchain = await Blockchain.create()

//     let ownerAddress = randomAddress()
//     let editorAddress = randomAddress()

//     const nftItem = blockchain.openContract(
//         NftItem.createFromConfig({
//             ownerAddress: ownerAddress,
//             editorAddress: editorAddress,
//             content: ""
//         }, code)
//     )

//     const deployer = await blockchain.treasury('deployer')

//     const deployResult = await nftItem.sendDeploy(deployer.getSender(), toNano('0.05'))

//     let owner = await nftItem.getNftData()
//     console.log(owner);
// }

// main();