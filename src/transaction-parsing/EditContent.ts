import { loadTransaction, Slice, Address, Cell } from "ton-core";

export type EditContentInfo = {
    queryId: number | undefined;
    from: Address | undefined;
    nftItem: Address | undefined;
    payload: Cell | undefined;
    value: bigint | undefined;
};

export function parseEditContentInfo(
    transaction: Slice,
): EditContentInfo | null {
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
        const editContentInfo: EditContentInfo = {
            queryId: body?.loadUint(64),
            from: tx.inMessage?.info.src,
            nftItem: tx.inMessage?.info.dest,
            payload: body?.loadRef(), // TODO: get exact info
            value: tx.inMessage?.info.value.coins,
        };

        return editContentInfo;
    }

    return null;
}