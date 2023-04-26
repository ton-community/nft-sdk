import { encodeOffChainContent } from "../types/OffchainContent";
import { compileFunc } from "../utils/compileFunc";
import { randomAddress } from "../utils/randomAddress";
import { NftItem, buildNftItemDataCell, NftItemSource } from "../wrappers/standard/NftItem";
import { Cell, ContractProvider, Sender } from "ton-core";

async function main() {
    // let config = {
    //     ownerAddress: randomAddress(),
    //     editorAddress: randomAddress(),
    //     content: ""
    // };

    // let code = await compileFunc(NftItemSource)
    // let data = buildNftItemDataCell(config)
    // let contract = NftItem.createFromAddress(
    //     randomAddress(),
    //     0,
    //     {
    //         code: code.cell,
    //         data: data,
    //     }
    // );

    // contract.sendDeploy(
        // new ContractProvider(),
        // new Sender(randomAddress()),
    // );
}
