import { loadTransaction, Slice, Address, Cell } from "ton-core";

export type Info = {
    type: "transfer" | "royalty_params" | "unknown" | null;
    info: NftTransferInfo | RoyaltyInfo | null;
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

export type RoyaltyInfo = {
    queryId: number | undefined;
    from: Address | undefined;
    nftItem: Address | undefined;
    value: bigint | undefined;
};

export type EditContentInfo = {
    queryId: number | undefined;
    from: Address | undefined;
    nftItem: Address | undefined;
    payload: Cell | undefined;
    value: bigint | undefined;
};

// transfer_editorship#1c04412a query_id:uint64 new_editor:MsgAddress response_destination:MsgAddress custom_payload:(Maybe ^Cell)  forward_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell) = EditRequest;

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
        } else if (
            op === 0x693d3950 &&
            tx.description.type === "generic" &&
            tx.description.computePhase.type === "vm"
        ) {
            const royaltyInfo: RoyaltyInfo = {
                queryId: body.loadUint(64),
                from: tx.inMessage.info.src,
                nftItem: body.loadAddress(),
                value: tx.inMessage.info.value.coins,
            };

            return {
                type: "royalty_params",
                info: royaltyInfo,
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