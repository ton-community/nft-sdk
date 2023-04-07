import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { toNano } from 'ton-core';
import { NftSdk } from '../wrappers/NftSdk';
import '@ton-community/test-utils';

describe('NftSdk', () => {
    let blockchain: Blockchain;
    let nftSdk: SandboxContract<NftSdk>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        nftSdk = blockchain.openContract(await NftSdk.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await nftSdk.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftSdk.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and nftSdk are ready to use
    });
});
