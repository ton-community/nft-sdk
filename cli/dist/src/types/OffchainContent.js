"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeOffChainContent = exports.storeOffchainContent = exports.makeSnakeCell = void 0;
const ton_core_1 = require("ton-core");
// offchain#01 uri:Text = FullContent;
const OFF_CHAIN_CONTENT_PREFIX = 0x01;
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
function bufferToChunks(buff, chunkSize) {
    let chunks = [];
    while (buff.byteLength > 0) {
        chunks.push(buff.slice(0, chunkSize));
        buff = buff.slice(chunkSize);
    }
    return chunks;
}
function makeSnakeCell(data) {
    let chunks = bufferToChunks(data, 127);
    let rootCell = (0, ton_core_1.beginCell)();
    let curCell = rootCell;
    for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        curCell.storeBuffer(chunk);
        if (chunks[i + 1]) {
            let nextCell = (0, ton_core_1.beginCell)();
            curCell.storeRef(nextCell);
            curCell = nextCell;
        }
    }
    return rootCell;
}
exports.makeSnakeCell = makeSnakeCell;
// export function loadOffchainContent(content: Cell): Offchain {
//     let data = flattenSnakeCell(content)
//     let prefix = data[0]
//     if (prefix !== OFF_CHAIN_CONTENT_PREFIX) {
//         throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
//     }
//     return {
//         uri: data.slice(1).toString()
//     }
// }
function storeOffchainContent(content) {
    let data = Buffer.from(content.uri);
    let offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX]);
    data = Buffer.concat([offChainPrefix, data]);
    return (builder) => {
        builder.storeRef(makeSnakeCell(data));
    };
}
exports.storeOffchainContent = storeOffchainContent;
function encodeOffChainContent(content) {
    let data = Buffer.from(content);
    let offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX]);
    data = Buffer.concat([offChainPrefix, data]);
    return makeSnakeCell(data);
}
exports.encodeOffChainContent = encodeOffChainContent;
//# sourceMappingURL=OffchainContent.js.map