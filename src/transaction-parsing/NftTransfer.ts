import { loadTransaction, Slice, Address, Cell } from "ton-core";

export type NftTransferInfo = {
    queryId: number | undefined;
    from: Address | undefined;
    to: Address | undefined;
    value: bigint | undefined;
    responseTo?: Address | null;
    customPayload: any | undefined;
    forwardAmount: bigint | undefined;
    forwardPayload: any | undefined;
};

export function parseNftTransferInfo(
    transaction: Slice,
): NftTransferInfo | null {
    const tx = loadTransaction(transaction);
    const body = tx.inMessage?.body.beginParse();
    
    let op;

    try {
        op = body?.loadUint(32);
    } catch {
        return null;
    }

    if (
        tx.inMessage?.info.type == "internal" 
        && tx.description.type == "generic" 
        && tx.description.computePhase.type == "vm"
    ) {
        const nftTransfer: NftTransferInfo = {
            queryId: body?.loadUint(64),
            from: tx.inMessage?.info.src,
            to: body?.loadAddress(),
            value: tx.inMessage?.info.value.coins,
            responseTo: body?.loadAddress(),
            customPayload: body?.loadBit(),
            forwardAmount: body?.loadCoins(),
            forwardPayload: body?.loadBit(),
        };

        return nftTransfer;
    }

    return null;
}