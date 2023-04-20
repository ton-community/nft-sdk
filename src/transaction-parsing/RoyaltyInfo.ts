import { loadTransaction, Slice, Address, Cell } from "ton-core";

export type RoyaltyInfo = {
    queryId: number | undefined;
    from: Address | undefined;
    nftItem: Address | undefined;
    value: bigint | undefined;
};

export function parseRoyaltyInfo(
    transaction: Slice,
): RoyaltyInfo | null {
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
        const royaltyInfo: RoyaltyInfo = {
            queryId: body?.loadUint(64),
            from: tx.inMessage?.info.src,
            nftItem: tx.inMessage?.info.dest,
            value: tx.inMessage?.info.value.coins,
        };

        return royaltyInfo;
    }

    return null;
}