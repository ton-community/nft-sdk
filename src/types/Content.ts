import { beginCell, Builder, Slice, Dictionary } from 'ton-core'
import { Cell } from 'ton'
import { Sha256 } from '@aws-crypto/sha256-js'

// offchain#01 uri:Text = FullContent

type OnchainContent = {
    type: 'onchain'
    knownKeys: Map<string, string>
    unknownKeys: Map<bigint, string>
};
  
type OffchainContent = {
    type: 'offchain'
    uri: string
};
  
type FullContent = OnchainContent | OffchainContent;
  
// onchain#00 data:(HashMapE 256 ^ContentData) = FullContent;
// offchain#01 uri:Text = FullContent;
// preloads a uint8 then calls either the onchain or the offchain variant
export function loadFullContent(slice: Slice): FullContent {
    const data = slice.preloadUint(8)

    switch (data) {

    case 0x00:
        return loadOnchainContent(slice)
    case 0x01:
        return loadOffchainContent(slice)
    default:    
        throw new Error(`Unknown content type: ${data.toString(16)}`)
        
    }
}

export function storeFullContent(src: FullContent): (builder: Builder) => void {
    switch (src.type) {
    case 'onchain':
        return storeOnchainContent(src)
    case 'offchain':
        return storeOffchainContent(src)
    default:
        throw new Error('Unknown content type')
    }
}
  
// onchain#00 data:(HashMapE 256 ^ContentData) = FullContent;
// loads a uint8, checks that it is 0x00, calls loadOnchainDict, inserts known keys into the respective fields
export function loadOnchainContent(slice: Slice): OnchainContent {
    const data = slice.loadUint(8)

    if (data !== 0x00) {
        throw new Error(`Unknown content type: ${data.toString(16)}`)
    }

    return {
        type: 'onchain',
        knownKeys: new Map(),
        unknownKeys: loadOnchainDict(slice)
    }
}

export function storeOnchainContent(src: OnchainContent): (builder: Builder) => void {
    return (builder: Builder) => {
        builder.storeUint(8, 0x00)
        builder.store(storeOnchainDict(src.unknownKeys))
    }
}

// offchain#01 uri:Text = FullContent;
// loads a uint8, checks that it is 0x01, calls loadSnakeData
export function loadOffchainContent(slice: Slice): OffchainContent {
    const prefix = slice.loadUint(8)

    if (prefix !== 0x01) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    
    return {
        type: 'offchain',
        uri: slice.loadStringTail()
    }
}

export function storeOffchainContent(src: OffchainContent): (builder: Builder) => void {
    let data = Buffer.from(src.uri)
    const offChainPrefix = Buffer.from([0x01])
    data = Buffer.concat([offChainPrefix, data])

    return (builder: Builder) => {
        builder
            .storeUint(0x01, 8)
            .storeStringTail(data.toString())
    }
}

// snake#00 data:(SnakeData ~n) = ContentData;
// chunks#01 data:ChunkedData = ContentData;
// preloads a uint8 then calls either loadSnakeData or loadChunkedData
export function loadContentData(slice: Slice): string {
    const data = slice.preloadUint(8)

    switch (data) {
    case 0x00:
        return loadSnakeData(slice)
    case 0x01:
        return loadChunkedData(slice)
    default:
        throw new Error(`Unknown content type: ${data.toString(16)}`)
    }
}
// notice that there is no storeContentData

// snake#00 data:(SnakeData ~n) = ContentData;
// loads a uint8, checks that it is 0x00, calls slice.loadStringTail
export function loadSnakeData(slice: Slice): string {
    const prefix = slice.loadUint(8)

    if (prefix !== 0x00) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    
    return slice.loadStringTail()
}

export function storeSnakeData(src: string): (builder: Builder) => void {
    return (builder: Builder) => {
        builder
            .storeUint(0x00, 8)
            .storeStringTail(src)
    }
}

// chunks#01 data:ChunkedData = ContentData;
// chunked_data#_ data:(HashMapE 32 ^(SnakeData ~0)) = ChunkedData;
// notice that above it is `SnakeData ~0` which means `the last layer` so there must be no refs in it, and it should be an integer number of bytes
// loads a uint8, checks that it is 0x01, calls loadChunkedRaw
export function loadChunkedData(slice: Slice): string {
    const prefix = slice.loadUint(8)

    if (prefix!== 0x01) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }

    return loadChunkedRaw(slice)
}

export function storeChunkedData(src: string): (builder: Builder) => void {
    return (builder: Builder) => {
        builder
            .storeUint(0x01, 8)
            .store(storeChunkedRaw(src))
    }
}

// these two only work with the dict (HashMapE 32 ^(SnakeData ~0))
// load must iterate over all parts and combine them, store must split the string as needed
export function loadChunkedRaw(slice: Slice): string {
    
}

export function storeChunkedRaw(src: string): (builder: Builder) => void {

}

// uses the Dictionary primitive with loadContentData to parse the dict
export function loadOnchainDict(slice: Slice): Map<bigint, string> {

}

// uses the Dictionary primitive and either storeSnakeData or storeChunkedData (probably just choose the former one for now)
export function storeOnchainDict(src: Map<bigint, string>): (builder: Builder) => void {
    const dict = Dictionary.empty(
        Dictionary.Keys.BigUint(256),
        Dictionary.Values.Cell()
    )

    /// CHECK: THIS
    Object.entries(src).forEach(([key, value]) => {
        dict.set(toKey(key), beginCell().store(storeSnakeData(value)).endCell())
    })

    return (builder: Builder) => {
        builder.storeDict(dict)
    }
}



const sha256 = (str: string) => {
    const sha = new Sha256()
    sha.update(str)
    return Buffer.from(sha.digestSync())
}

const toKey = (key: string) => {
    return BigInt(`0x${sha256(key).toString('hex')}`)
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

// export function loadOffchainContent(content: Cell): Offchain {
//     const data = flattenSnakeCell(content)

//     const prefix = data[0]
//     if (prefix !== OFF_CHAIN_CONTENT_PREFIX) {
//         throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
//     }
//     return {
//         uri: data.slice(1).toString()
//     }
// }

// export function storeOffchainContent(content: Offchain) {
//     let data = Buffer.from(content.uri)
//     const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
//     data = Buffer.concat([offChainPrefix, data])

//     return (builder: Builder) => {
//         builder.storeRef(
//             makeSnakeCell(data)
//         )
//     }
// }

export function encodeOffChainContent(content: string) {
    let data = Buffer.from(content)
    const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
    data = Buffer.concat([offChainPrefix, data])
    return makeSnakeCell(data)
}


export function decodeOffChainContent(content: Cell): string {
    const data = flattenSnakeCell(content)

    const prefix = data[0]
    if (prefix !== OFF_CHAIN_CONTENT_PREFIX) {
        throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
    }
    return data.slice(1).toString()
}