import { loadTransaction, Slice, Address, Cell } from "ton-core";
import { isEligibleTransaction } from "../utils/EligibleInternalTx";

export type RoyaltyInfo = {
  queryId: number;
  from: Address;
  nftItem: Address;
  value: bigint;
};
function extractRoyaltyInfo(body: any): RoyaltyInfo {
  return {
    queryId: body?.loadUint(64),
    from: body?.info.src,
    nftItem: body?.info.dest,
    value: body?.info.value.coins,
  };
}

export function parseRoyaltyInfo(
  transaction: Slice
): RoyaltyInfo | null {
  const tx = loadTransaction(transaction);
  const body = tx.inMessage?.body.beginParse();

  let op;
  try {
    op = body?.loadUint(32);
  } catch {
    return null;
  }

  if (isEligibleTransaction(tx)) {
    return extractRoyaltyInfo(body);
  }

  return null;
}
