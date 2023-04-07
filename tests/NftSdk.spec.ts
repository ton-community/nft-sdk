import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { NftSdk } from '../wrappers/NftSdk';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('NftSdk', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NftSdk');
    });

    let blockchain: Blockchain;
    let nftSdk: SandboxContract<NftSdk>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        nftSdk = blockchain.openContract(NftSdk.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await nftSdk.sendDeploy(deployer.getSender(), toNano('0.05'));

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
