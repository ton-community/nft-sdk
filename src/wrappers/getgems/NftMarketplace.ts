import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core';
import { KeyPair, sign } from 'ton-crypto';

export class NftMarketplace implements Contract {
    constructor(readonly address: Address, readonly workchain?: number, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(
        address: Address
    ) {
        return new NftMarketplace(
            address
            );
    }


    static async createFromConfig(
        config: NftMarketplaceData
    ) {

        let data = buildNftMarketplaceDataCell(config);
        let address = contractAddress(
            0,
            {
                code: NftMarketplaceCodeCell,
                data: data
            }
        )

        return new NftMarketplace(
            address,
            0,
            {
                code: NftMarketplaceCodeCell,
                data: data
            }
        )
    }

    // Deployment
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            body: beginCell().endCell(),
        })
    }


    async sendCoins(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }
}

// Utils

export type NftMarketplaceData = {
    seqno: number
    subwallet: number
    publicKey: Buffer
}

export function buildNftMarketplaceDataCell(data: NftMarketplaceData) {
    let dataCell = beginCell()

    dataCell.storeUint(data.seqno, 32)
    dataCell.storeUint(data.subwallet, 32)
    dataCell.storeBuffer(data.publicKey)

    return dataCell.endCell()
}

export function buildSignature(params: { 
    keyPair: KeyPair, 
    saleStateInit: Cell, 
    saleMessageBody: Cell 
}) {
  let bodyCell = beginCell()
  bodyCell.storeRef(params.saleStateInit)
  bodyCell.storeRef(params.saleMessageBody)

  return sign(bodyCell.endCell().hash(), params.keyPair.secretKey)
}


// Data

export const NftMarketplaceCodeBoc = 'te6cckEBDAEA7wABFP8A9KQT9LzyyAsBAgEgAwIAePKDCNcYINMf0x/THwL4I7vyY/ABUTK68qFRRLryogT5AVQQVfkQ8qP4AJMg10qW0wfUAvsA6DABpALwAgIBSAcEAgFIBgUAEbjJftRNDXCx+AAXuznO1E0NM/MdcL/4AgLOCQgAF0AsjLH8sfy//J7VSAIBIAsKABU7UTQ0x/TH9P/MIACpGwiIMcAkVvgAdDTAzBxsJEw4PABbCEB0x8BwAGONIMI1xgg+QFAA/kQ8qPU1DAh+QBwyMoHy//J0Hd0gBjIywXLAljPFnD6AstrEszMyYBA+wDgW4NC26jQ='

export const NftMarketplaceCodeCell = Cell.fromBoc(Buffer.from(NftMarketplaceCodeBoc, 'base64'))[0]