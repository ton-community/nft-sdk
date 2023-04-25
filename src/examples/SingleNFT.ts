// import { compileFunc } from "ton-compiler";
// import { randomAddress } from "../utils/randomAddress";
// import { NftItem, buildNftItemDataCell, NftItemSource } from "../wrappers/standard/NftItem";
// import { Cell, ContractProvider, Sender } from "ton-core";

// async function main() {

//     let config = {
//         ownerAddress: randomAddress(),
//         editorAddress: randomAddress(),
//         content: ""
//     };

//     let code = await compileFunc(NftItemSource)
//     let data = buildNftItemDataCell(config)
//     let contract = NftItem.createFromAddress(
//         randomAddress(),
//         0,
//         {
//             code: Cell.fromBoc(Buffer.from(code, 'base64'))[0],
//             data: data,
//         }
//     );

//     contract.sendDeploy();
// }
