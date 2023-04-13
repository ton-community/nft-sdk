import { loadTransaction, Slice, Address } from "ton-core";

export type Info = {
    type: "transfer" | "unknown" | null;
    info: NftTransferInfo | null;
};

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

export function parseTransactionData(transaction: Slice): Info {
    const tx = loadTransaction(transaction);

    if (tx.inMessage?.info.type === "internal") {
        const body = tx.inMessage.body.beginParse();
        let op;

        try {
            op = body.loadUint(32);
        } catch {
            return {
                type: "unknown",
                info: null,
            }
        }

        if (
            op === 0x5fcc3d14 &&
            tx.description.type === "generic" &&
            tx.description.computePhase.type === "vm"
        ) {
            const nftTransfer: NftTransferInfo = {
                queryId: body.loadUint(64),
                from: tx.inMessage.info.src,
                to: body.loadAddress(),
                value: tx.inMessage.info.value.coins,
                responseTo: body.loadAddress(),
                customPayload: body.loadMaybeRef(),
                forwardAmount: body.loadCoins(),
                forwardPayload: body.loadMaybeRef(),
            };

            return {
                type: "transfer",
                info: nftTransfer,
            };
        } else {
            return {
                type: "unknown",
                info: null
            }
        }
    }

    return {
        type: null,
        info: null,
    };
}

export function parseNftTransferInfo(
    transaction: Slice,
): NftTransferInfo | null {
    const tx = loadTransaction(transaction);
    const body = tx.inMessage?.body.beginParse();
    
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