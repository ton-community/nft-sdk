import { env } from 'process'
import { KeyPair, keyPairFromSecretKey } from "ton-crypto"
import { readFileSync } from 'fs';

export async function importKeyPair(
    secretKey?: string
) {
    let keyPair: KeyPair;

    if (secretKey) {
        keyPair = keyPairFromSecretKey(Buffer.from(secretKey, 'hex'));
    } else {
        const content = readFileSync(String(env.SECRET_KEY), 'utf-8');
        keyPair = keyPairFromSecretKey(Buffer.from(content, 'hex'));
    }

    return keyPair;
}

export default importKeyPair;