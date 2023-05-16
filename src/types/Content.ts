import { beginCell, Builder, Slice, Dictionary } from 'ton-core'

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
    return (builder: Builder) => {
        builder
            .storeUint(0x01, 8)
            .storeStringTail(src.uri)
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

    if (prefix !== 0x01) {
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
    const dict = slice.loadDict(
        Dictionary.Keys.Uint(32), 
        Dictionary.Values.Cell()
    )

    let data = ''

    for (let i = 0; i < dict.size; i++) {
        const key = dict.keys()[i]
        const value = dict.get(i)

        if (!value) {
            throw new Error(`Missing value for key: ${key.toString(16)}`)
        }
    
        if (!dict.has(key)) {
            throw new Error(`Key ${key} is not present in the dictionary`)
        }
    
        data += (value.beginParse().loadStringRefTail())
    }

    return data
}

export function storeChunkedRaw(src: string): (builder: Builder) => void {
    const dict = Dictionary.empty(
        Dictionary.Keys.Uint(32),
        Dictionary.Values.Cell()
    )

    const nChunks = Math.ceil(src.length / 127)

    for (let i = 0; i < nChunks; i++) {
        const chunk = src.slice(i * 127, (i + 1) * 127)
        dict.set(i, beginCell().storeStringRefTail(chunk).endCell())
    }

    return (builder: Builder) => {
        builder
            .storeDict(
                dict
            )
    }
}

// uses the Dictionary primitive with loadContentData to parse the dict
export function loadOnchainDict(slice: Slice): Map<bigint, string> {
    const dict = slice.loadDict(
        Dictionary.Keys.BigUint(256), 
        Dictionary.Values.Cell()
    )

    const data = new Map<bigint, string>()

    for (const [key, value] of dict) {
        data.set(key, loadContentData(value.beginParse()))
    }

    return data
}

// uses the Dictionary primitive and either storeSnakeData or storeChunkedData (probably just choose the former one for now)
export function storeOnchainDict(src: Map<bigint, string>): (builder: Builder) => void {
    const dict = Dictionary.empty(
        Dictionary.Keys.BigUint(256),
        Dictionary.Values.Cell()
    )

    for (const [key, value] of src) {
        dict.set(key, beginCell().store(storeSnakeData(value)).endCell())
    }

    return (builder: Builder) => {
        builder.storeDict(dict)
    }
}