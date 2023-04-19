import { beginCell, Builder } from "ton";
import { Cell, DictBuilder } from "ton";
import { Slice } from "ton";
import { Dictionary } from "ton-core";

// onchain#00 data:(HashMapE 256 ^ContentData) = FullContent;

// const ON_CHAIN_CONTENT_PREFIX = 0x00;

// export type Onchain = {
//     data: Dictionary<256, Cell>,
// };

// export function flattenSnakeCell(cell: Cell) {
//     let c: Cell|null = cell

//     let res = Buffer.alloc(0)

//     while (c) {
//         let cs = c.beginParse()
//         let data = cs.readRemainingBytes()
//         res = Buffer.concat([res, data])
//         c = c.refs[0]
//     }

//     return res
// }

// function bufferToChunks(buff: Buffer, chunkSize: number) {
//     let chunks: Buffer[] = []
//     while (buff.byteLength > 0) {
//         chunks.push(buff.slice(0, chunkSize))
//         buff = buff.slice(chunkSize)
//     }
//     return chunks
// }

// export function makeSnakeCell(data: Buffer) {
//     let chunks = bufferToChunks(data, 127)
//     let rootCell = new Cell()
//     let curCell = rootCell

//     for (let i = 0; i < chunks.length; i++) {
//         let chunk = chunks[i]

//         curCell.bits.writeBuffer(chunk)

//         if (chunks[i+1]) {
//             let nextCell = new Cell()
//             curCell.refs.push(nextCell)
//             curCell = nextCell
//         }
//     }

//     return rootCell
// }

// export function loadOffchainContent(content: Cell): Onchain {
//     let data = flattenSnakeCell(content)

//     let prefix = data[0]
//     if (prefix !== ON_CHAIN_CONTENT_PREFIX) {
//         throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
//     }

//     let contentData = data;
//     let contentDict = new DictBuilder()
//     contentDict.storeCell(0, contentData);

//     return {
//         data: data.slice(1)
//     }
// }

// export function storeOffchainContent(content: Onchain) {
//     let data = Buffer.from(content.data)
//     let offChainPrefix = Buffer.from([ON_CHAIN_CONTENT_PREFIX])
//     data = Buffer.concat([offChainPrefix, data])

//     return (builder: Builder) => {
//         builder.storeRef(
//             makeSnakeCell(data)
//         );
//     };
// }