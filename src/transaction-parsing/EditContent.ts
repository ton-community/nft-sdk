import { loadTransaction, Slice, Address, Cell } from "ton-core";
import { isEligibleTransaction } from "../utils/EligibleInternalTx";

export type EditContentInfo = {
    queryId: number;
    from: Address;
    nftItem: Address;
    payload: Cell;
    value: bigint;
};


function extractEditContentInfo(body: any): EditContentInfo {
    return {
        queryId: body?.loadUint(64),
        from: body.inMessage?.info.src,
        nftItem: body.inMessage?.info.dest,
        payload: body?.loadRef(), // TODO: get exact info
        value: body.inMessage?.info.value.coins,
    };
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
    
    if (isEligibleTransaction(tx)) {
        return extractEditContentInfo(body)
    }

    return null;
}