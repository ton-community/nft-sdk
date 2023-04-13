
 

import {Cell} from "ton";

// text#_ {n:#} data:(SnakeData ~n) = Text;
// snake#00 data:(SnakeData ~n) = ContentData;
// chunks#01 data:ChunkedData = ContentData;
// onchain#00 data:(HashMapE 256 ^ContentData) = FullContent;
// offchain#01 uri:Text = FullContent;

const OFF_CHAIN_CONTENT_PREFIX = 0x01
const ON_CHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_PREFIX = 0x00;
const CHUNKS_PREFIX = 0x01;


export function flattenSnakeCell(cell: Cell) {
    let c: Cell|null = cell

    let res = Buffer.alloc(0)

    while (c) {
        let cs = c.beginParse()
        let data = cs.readRemainingBytes()
        res = Buffer.concat([res, data])
        c = c.refs[0]
    }

    return res
}

function bufferToChunks(buff: Buffer, chunkSize: number) {
    let chunks: Buffer[] = []
    while (buff.byteLength > 0) {
        chunks.push(buff.slice(0, chunkSize))
        buff = buff.slice(chunkSize)
    }
    return chunks
}

export function makeSnakeCell(data: Buffer) {
    let chunks = bufferToChunks(data, 127)
    let rootCell = new Cell()
    let curCell = rootCell

    for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i]

        curCell.bits.writeBuffer(chunk)

        if (chunks[i+1]) {
            let nextCell = new Cell()
            curCell.refs.push(nextCell)
            curCell = nextCell
        }
    }

    return rootCell
}

export function encodeOffChainContent(content: string) {
    let data = Buffer.from(content)
    let offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
    data = Buffer.concat([offChainPrefix, data])
    return makeSnakeCell(data)
}

export function decodeOffChainContent(content: Cell) {
    let data = flattenSnakeCell(content)

    let prefix = data[0]
    if (prefix !== OFF_CHAIN_CONTENT_PREFIX) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    return data.slice(1).toString()
}

export function encodeOnChainContent(content: string) {
    let data = Buffer.from(content)
    let onChainPrefix = Buffer.from([ON_CHAIN_CONTENT_PREFIX])
    data = Buffer.concat([onChainPrefix, data])
    return makeSnakeCell(data)
}

export function decodeOnChainContent(content: Cell) {
    let data = flattenSnakeCell(content)

    let prefix = data[0]
    if (prefix!== ON_CHAIN_CONTENT_PREFIX) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    return data.slice(1).toString()
}

export function encodeSnakeContent(content: string) {
    let data = Buffer.from(content)
    let snakePrefix = Buffer.from([SNAKE_PREFIX])
    data = Buffer.concat([snakePrefix, data])
    return makeSnakeCell(data)
}

export function decodeSnakeContent(content: Cell) {
    let data = flattenSnakeCell(content)

    let prefix = data[0]
    if (prefix!== SNAKE_PREFIX) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    return data.slice(1).toString()
}

export function encodeChunksContent(content: string) {
    let data = Buffer.from(content)
    let chunksPrefix = Buffer.from([CHUNKS_PREFIX])
    data = Buffer.concat([chunksPrefix, data])
    return makeSnakeCell(data)
}

export function decodeChunksContent(content: Cell) {
    let data = flattenSnakeCell(content)

    let prefix = data[0]
    if (prefix!== CHUNKS_PREFIX) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    return data.slice(1).toString()
}