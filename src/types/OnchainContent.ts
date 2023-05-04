import { beginCell, Builder } from "ton";
import { Cell, beginDict } from "ton";
import { Slice } from "ton";
import { Dictionary } from "ton-core";
// @ts-ignore
import { Sha256 } from "@aws-crypto/sha256-js";
import {BN} from 'bn.js';

// onchain#00 data:(HashMapE 256 ^ContentData) = FullContent;

const ONCHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_PREFIX = 0x00;


const sha256 = (str: string) => {
    const sha = new Sha256();
    sha.update(str);
    return Buffer.from(sha.digestSync());
  };

export type MetaDataKeys =
  | "name"
  | "description"
  | "image"
  | "symbol"
  | "image_data"
  | "decimals";

const onChainContentSpec: {
    [key in MetaDataKeys]: "utf8" | "ascii" | undefined;
  } = {
    name: "utf8",
    description: "utf8",
    image: "ascii",
    decimals: "utf8",
    symbol: "utf8",
    image_data: undefined,
  };

export function storeOnchainContent(data: { [s: string]: string | undefined }): Builder {
    const KEYLEN = 256;
    const dict = beginDict(KEYLEN);
  
    Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {
      if (!onChainContentSpec[k as MetaDataKeys])
        throw new Error(`Unsupported onchain key: ${k}`);
      if (v === undefined || v === "") return;
  
      let bufferToStore = Buffer.from(v, onChainContentSpec[k as MetaDataKeys]);
  
      const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);
  
      const rootCell = new Cell();
      rootCell.bits.writeUint8(SNAKE_PREFIX);
      let currentCell = rootCell;
  
      while (bufferToStore.length > 0) {
        currentCell.bits.writeBuffer(bufferToStore.slice(0, CELL_MAX_SIZE_BYTES));
        bufferToStore = bufferToStore.slice(CELL_MAX_SIZE_BYTES);
        if (bufferToStore.length > 0) {
          let newCell = new Cell();
          currentCell.refs.push(newCell);
          currentCell = newCell;
        }
      }
  
      dict.storeRef(sha256(k), rootCell);
    });
  
    return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict.endDict());
  }


export function loadOnChainContent(contentSlice: Slice): {
    metadata: { [s in MetaDataKeys]?: string };
    isDeployerFaultyOnChainData: boolean;
  } {
    // Note that this relies on what is (perhaps) an internal implementation detail:
    // "ton" library dict parser converts: key (provided as buffer) => BN(base10)
    // and upon parsing, it reads it back to a BN(base10)
    // tl;dr if we want to read the map back to a JSON with string keys, we have to convert BN(10) back to hex
    const toKey = (str: string) => new BN(str, "hex").toString(10);
    const KEYLEN = 256;
  
    let isDeployerFaultyOnChainData = false;
  
    const dict = contentSlice.readDict(KEYLEN, (s) => {
      let buffer = Buffer.from("");
  
      const sliceToVal = (s: Slice, v: Buffer, isFirst: boolean) => {
        s.toCell().beginParse();
        if (isFirst && s.readUint(8).toNumber() !== SNAKE_PREFIX)
          throw new Error("Only snake format is supported");
  
        v = Buffer.concat([v, s.readRemainingBytes()]);
        if (s.remainingRefs === 1) {
          v = sliceToVal(s.readRef(), v, false);
        }
  
        return v;
      };
  
      if (s.remainingRefs === 0) {
        isDeployerFaultyOnChainData = true;
        return sliceToVal(s, buffer, true);
      }
  
      return sliceToVal(s.readRef(), buffer, true);
    });
  
    const res: { [s in MetaDataKeys]?: string } = {};
  
    Object.keys(onChainContentSpec).forEach((k) => {
      const val = dict
        .get(toKey(sha256(k).toString("hex")))
        ?.toString(onChainContentSpec[k as MetaDataKeys]);
      if (val) res[k as MetaDataKeys] = val;
    });
  
    return {
      metadata: res,
      isDeployerFaultyOnChainData,
    };
  }