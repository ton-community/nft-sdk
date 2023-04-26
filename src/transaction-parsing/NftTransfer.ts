import { loadTransaction, Slice, Address, Cell } from "ton-core";
import { isEligibleTransaction } from "../utils/EligibleInternalTx";

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

function extractNftTransferInfo(body: any): NftTransferInfo {
  return {
    queryId: body?.loadUint(64),
    from: body?.info.src,
    to: body?.loadAddress(),
    value: body?.info.value.coins,
    responseTo: body?.loadAddress(),
    customPayload: body?.loadBit(),
    forwardAmount: body?.loadCoins(),
    forwardPayload: body?.loadBit(),
  };
}

export function parseNftTransferInfo(
  transaction: Slice
): NftTransferInfo | null {
  const tx = loadTransaction(transaction);
  const body = tx.inMessage?.body.beginParse();

  let op;
  try {
    op = body?.loadUint(32);
  } catch {
    return null;
  }

  if (isEligibleTransaction(tx)) {
    return extractNftTransferInfo(body);
  }

  return null;
}
