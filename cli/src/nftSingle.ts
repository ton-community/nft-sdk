import { Sender, toNano } from 'ton-core'
import {NftSingle, NftSingleData} from '../../src/wrappers/getgems/NftSingle/NftSingle'
import importKeyPair from './utils/importKeyPair';
import { readFileSync, writeFileSync } from 'fs';
import { error } from 'console';
import { env } from 'process';
import { Address } from 'ton-core'
import { TonClient4 } from 'ton';
import createSender from './utils/createSender'

export async function createNftSingle(
    client: TonClient4,
    config: NftSingleData,
    options?: {
        secretKey?: string
    }
) {
    let keypair = await importKeyPair(options?.secretKey);
    
    let sender = await createSender(keypair, client)
    

    const nftSingle = client.open(
        await NftSingle.createFromConfig(
            config
        )
    );

    await nftSingle.sendDeploy(sender, toNano('0.05'));

    console.log(
        `NFT Single deployed at ${nftSingle.address}`
    )

    await writeFileSync(
        './nftSingle.json',
        JSON.stringify({
            config: config,
            address: nftSingle.address,
            init: nftSingle.init
        }
    ))
    
    console.log(
        `Saved Config`
    )

    return nftSingle;
}

export async function importExistingNftSingle(
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

        const nftSingle = client.open(
            await NftSingle.createFromAddress(
                config.address
            )
        );

        return nftSingle
    } else {
        const config = JSON.parse(readFileSync(String(env.PATH_TO_CONFIG), 'utf-8'));

        const nftSingle = client.open(
            await NftSingle.createFromAddress(
                config.address
            )
        );

        return nftSingle;
    }
}

export async function transfer(
    client: TonClient4,
    destination: string,
    options?: {
        configPath?: string,
        secretKey?: string
    }
) {
    const nftSingle = await importExistingNftSingle(
        client,
        options
    );

    let keypair = await importKeyPair(
        options?.secretKey
    )

    let sender = await createSender(keypair, client);

    let tx = await nftSingle.sendTransfer(
        sender,
        {
            value: toNano('0.05'),
            queryId: toNano('0'),
            newOwner: Address.parse(destination),
            responseDestination: sender.address,
            forwardAmount: toNano('0')
        }
    );

    console.log(
        `Transferred NFT from ${sender.address?.toString()} to ${destination}`
    )
}