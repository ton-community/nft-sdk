import {Address} from 'ton-core'
import {NftItem} from '../src/wrappers/standard/NftItem'
import { TonClient } from 'ton'
import { getHttpEndpoint } from '@orbs-network/ton-access'

async function main() {
    // Config
    const client = new TonClient({
        endpoint: await getHttpEndpoint()
    })

    // Transfer TX
    const txData = await client.getTransactions(Address.parse('EQCWbV3k8hlLGiFlxPE_RAJDLUpm_WnCCbCxaprvWxh1_AOI'), {
        limit: 10,
        hash: 'odtysMOr5JY0JQ+31TtmzGzldPBH2IMTIL21CAiJ9G8='
    })

    console.log(txData)

    const data = NftItem.parseTransfer(txData[0])

    // Prints Transaction Data
    console.log(data)
}

main()