import { Sender, toNano } from 'ton-core';
import {NftCollection, NftCollectionData} from '../../src/wrappers/getgems/NftCollection'
import importKeyPair from './utils/importKeyPair';
import { readFileSync, writeFileSync } from 'fs';
import { error } from 'console';
import { env } from 'process';
import { Address } from 'ton-core';
import { TonClient4 } from 'ton';
import createSender from './utils/createSender'

export async function createNftCollection(
    client: TonClient4,
    config: NftCollectionData,
    options?: {
        secretKey?: string
    }
) {
    let keypair = await importKeyPair(options?.secretKey);
    
    let sender = await createSender(keypair, client)
    

    const nftCollection = client.open(
        await NftCollection.createFromConfig(
            config
        )
    );

    await nftCollection.sendDeploy(sender, toNano('0.05'));

    console.log(
        `NFT Single deployed at ${nftCollection.address}`
    )

    await writeFileSync(
        './NftCollection.json',
        JSON.stringify({
            config: config,
            address: nftCollection.address,
            init: nftCollection.init
        }
    ))
    
    console.log(
        `Saved Config`
    )

    return nftCollection;
}

export async function importExistingNftCollection(
    client: TonClient4,
    options?: {
        configPath?: string
    }
) {
    if (options?.configPath) {
        const config = JSON.parse(
            readFileSync(
                options?.configPath,
                'utf-8'
            )
        )

        const nftCollection = client.open(
            await NftCollection.createFromAddress(
                config.address
            )
        );

        return nftCollection
    } else {
        const config = JSON.parse(readFileSync(String(env.PATH_TO_CONFIG), 'utf-8'));

        const nftCollection = client.open(
            await NftCollection.createFromAddress(
                config.address
            )
        );

        return nftCollection;
    }
}