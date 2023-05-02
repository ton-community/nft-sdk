import { KeyPair } from "ton-crypto";
import { TonClient4, WalletContractV4 } from "ton";

export async function createSender(
    keypair: KeyPair,
    client: TonClient4
) {
    let wallet = WalletContractV4.create(
        {
            workchain: 0,
            publicKey: keypair.publicKey
        }
    )
    
    let contract = client.open(
        wallet
    );

    return contract.sender(keypair.secretKey);
}

export default createSender;