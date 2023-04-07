import { toNano } from 'ton-core';
import { NftSdk } from '../wrappers/NftSdk';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftSdk = provider.open(NftSdk.createFromConfig({}, await compile('NftSdk')));

    await nftSdk.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nftSdk.address);

    // run methods on `nftSdk`
}
