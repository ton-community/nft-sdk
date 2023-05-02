import {
    loadTransaction,
    Slice,
    Address,
    Cell
  } from "ton-core";
import { isEligibleTransaction } from "../utils/EligibleInternalTx";
  
  export type TransferEditorshipInfo = {
    queryId: number;
    from: Address;
    nftItem: Address;
    newEditor: Address;
    responseDestination: Address;
    customPayload?: Cell;
    forwardAmount?: bigint;
    forwardPayload?: Cell;
    value: bigint;
  };
  
  function extractTransferEditorshipInfo(body: any): TransferEditorshipInfo {
    return {
      queryId: body?.loadUint(64),
      from: body?.info.src,
      nftItem: body?.info.dest,
      newEditor: body?.loadAddress(),
      responseDestination: body?.loadAddress(),
      customPayload: body?.loadMaybeRef(),
      forwardAmount: body?.loadCoins(),
      forwardPayload: body?.loadMaybeRef(),
      value: body?.info.value.coins,
    };
  }
  
  export function parseTransferEditorshipInfo(
    transaction: Slice
  ): TransferEditorshipInfo | null {
    const tx = loadTransaction(transaction);
    const body = tx.inMessage?.body.beginParse();
  
    let op;
    try {
      op = body?.loadUint(32);
    } catch {
      return null;
    }
  
    if (isEligibleTransaction(tx)) {
      return extractTransferEditorshipInfo(body);
    }
  
    return null;
  }
  