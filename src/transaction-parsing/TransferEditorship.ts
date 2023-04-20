import { loadTransaction, Slice, Address, Cell } from "ton-core";

export type TransferEditorshipInfo = {
    queryId: number | undefined;
    from: Address | undefined;
    nftItem: Address | undefined;
    newEditor: Address | undefined;
    responseDestination: Address | undefined;
    customPayload?: Cell | null;
    forwardAmount?: bigint;
    forwardPayload?: Cell | null;
    value: bigint | undefined;
};

export function parseTransferEditorshipInfo(
    transaction: Slice,
): TransferEditorshipInfo | null {
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
        const transferEditorshipInfo: TransferEditorshipInfo = {
            queryId: body?.loadUint(64),
            from: tx.inMessage?.info.src,
            nftItem: tx.inMessage?.info.dest,
            newEditor: body?.loadAddress(),
            responseDestination: body?.loadAddress(),
            customPayload: body?.loadMaybeRef(),
            forwardAmount: body?.loadCoins(),
            forwardPayload: body?.loadMaybeRef(),
            value: tx.inMessage?.info.value.coins,
        };

        return transferEditorshipInfo;
    }

    return null;
}