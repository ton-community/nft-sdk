import { toNano } from 'ton-core';
import { NftSdk } from '../wrappers/NftSdk';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftSdk = provider.open(await NftSdk.fromInit());

    await nftSdk.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(nftSdk.address);

    // run methods on `nftSdk`
}
