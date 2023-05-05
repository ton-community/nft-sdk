import { beginCell, Builder } from 'ton-core'
import { Cell } from 'ton'

// offchain#01 uri:Text = FullContent

const OFF_CHAIN_CONTENT_PREFIX = 0x01

export type Offchain = {
    uri: string,
}

export function flattenSnakeCell(cell: Cell) {
    let c: Cell | null = cell

    let res = Buffer.alloc(0)

    while (c) {
        const cs = c.beginParse()

        const data = cs.loadBuffer(cs.remainingBits / 8)
        res = Buffer.concat([res, data])
        c = c.refs[0]
    }

    return res
}

function bufferToChunks(buff: Buffer, chunkSize: number) {
    const chunks: Buffer[] = []
    while (buff.byteLength > 0) {
        chunks.push(buff.slice(0, chunkSize))
        buff = buff.slice(chunkSize)
    }
    return chunks
}

export function makeSnakeCell(data: Buffer) {
    const chunks = bufferToChunks(data, 127)
    const rootCell = beginCell()
    let curCell = rootCell

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        curCell.storeBuffer(chunk)

        if (chunks[i + 1]) {
            const nextCell = beginCell()
            curCell.storeRef(nextCell)
            curCell = nextCell
        }
    }

    return rootCell.endCell()
}

export function loadOffchainContent(content: Cell): Offchain {
    const data = flattenSnakeCell(content)

    const prefix = data[0]
    if (prefix !== OFF_CHAIN_CONTENT_PREFIX) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    return {
        uri: data.slice(1).toString()
    }
}

export function storeOffchainContent(content: Offchain) {
    let data = Buffer.from(content.uri)
    const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
    data = Buffer.concat([offChainPrefix, data])

    return (builder: Builder) => {
        builder.storeRef(
            makeSnakeCell(data)
        )
    }
}

export function encodeOffChainContent(content: string) {
    let data = Buffer.from(content)
    const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
    data = Buffer.concat([offChainPrefix, data])
    return makeSnakeCell(data)
}