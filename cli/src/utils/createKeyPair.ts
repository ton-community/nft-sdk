import { writeFileSync } from "fs";
import {mnemonicNew, mnemonicToPrivateKey} from "ton-crypto"

export async function createKeyPair() {
    let mnemonic = await mnemonicNew()
    let keypair = await mnemonicToPrivateKey(mnemonic)

    writeFileSync(
        "./keypair.json",
        JSON.stringify(keypair)
    );

    writeFileSync(
        "./.env",
        `SECRET_KEY=${keypair.secretKey.toString()}`
    )
}

export default createKeyPair;