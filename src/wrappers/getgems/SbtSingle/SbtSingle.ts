import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, contractAddress } from 'ton-core'
import { storeOffchainContent } from '../../../types/Content'

/**
 * Represents a single item of the SBT (Soul Bound Token) NFT.
 * Implements the Contract interface.
 */
export class SbtSingle implements Contract {
    /**
     * Constructs an instance of the SbtSingle contract.
     * @param address - The address of the contract.
     * @param init - Optional initialization data for the contract.
     */
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    // Data

    static code = Cell.fromBoc(Buffer.from('te6ccgECGQEABBgAART/APSkE/S88sgLAQIBYgIDAgLOBAUCASATFAIBIAYHAgEgERIB7QyIccAkl8D4NDTA/pA+kAx+gAxcdch+gAx+gAw8AID0x8DcbCOTBAkXwTTH4IQBSTHrhK6jjnTPzCAEPhCcIIQwY6G0lUDbYBAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wCRMOLgAtM/gCAARPpEMHC68uFNgBPyCEC/LJqJSQLqOQDBsIjJwyMv/iwLPFoAQcIIQi3cXNUBVA4BAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wDgghDQw7/qUkC64wKCEATe0UhSQLrjAoIQHARBKlJAuo6FM0AD2zzgNDSCEBoLnVFSILoJCgsMAMBsM/pA1NMAMPhFcMjL/1AGzxb4Qs8WEswUyz9SMMsAA8MAlvhDUAPMAt6AEHixcIIQDdYH40A1FIBAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wAAyGwz+EJQA8cF8uGRAfpA1NMAMPhFcMjL//hCzxYTzBLLP1IQywABwwCU+EMBzN6AEHixcIIQBSTHrkBVA4BAA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wAB9PhBFMcF8uGR+kAh8AH6QNIAMfoAggr68IAXoSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY49yPhBzxZQB88WgBCCEFEaRGMTcSZUSFADyMsfEss/IW6zkwHPF5Ex4slxBcjLBVAEzxZY+gITy2rMyQH7AJI2MOIDDQP+jhAxMvhBEscF8uGa1DD4Y/AD4DKCEB8EU3pSELqORzD4QiHHBfLhkYAQcIIQ1TJ220EEbYMGA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wCLAvhiiwL4ZPAD4IIQb4n141IQuuMCghDRNtOzUhC64wJsIQ4PEACAjjYi8AGAEIIQ1TJ22xRFA21xA8jLHxLLPyFus5MBzxeRMeLJcQXIywVQBM8WWPoCE8tqzMkB+wCSbDHi+GHwAwAuMDH4RAHHBfLhkfhFwADy4ZP4I/hl8AMAijD4QiHHBfLhkYIK+vCAcPsCgBBwghDVMnbbQQRtgwYDyMsfEss/IW6zkwHPF5Ex4slxBcjLBVAEzxZY+gITy2rMyQH7AAAgghBfzD0UupPywZ3ehA/y8AA3O1E0PpAAfhi+kAB+GHUAfhj+kAB+GTTPzD4ZYAAvPhF+EPI+ELPFvhBzxbM+ETPFss/ye1UgAgFYFRYAGbx+f4AT+4RYF8IXwhwADbVjHgBfCJACASAXGAANsB08AL4QYAANs2D8AL4RYA==', 'base64'))[0]

    /**
     * Builds a data cell for the SbtSingle contract.
     * @param data - The data for the contract.
     * @returns A data cell.
     */
    static buildDataCell(data: SbtSingleData) {
        const dataCell= beginCell()
    
        const contentCell = storeOffchainContent({
            type: 'offchain',
            uri: data.content
        })
    
        dataCell.storeAddress(data.ownerAddress)
        dataCell.storeAddress(data.editorAddress)
        dataCell.store(contentCell)
        dataCell.storeAddress(data.authorityAddress)
        dataCell.storeUint(data.revokedAt ? data.revokedAt : 0, 64)
    
        return dataCell.endCell()
    }

    /**
     * Constructs an instance of the SbtSingle contract from an address.
     * @param address - The address of the contract.
     * @returns An instance of SbtSingle.
     */
    static createFromAddress(
        address: Address
    ) {
        return new SbtSingle(
            address
        )
    }

    /**
     * Constructs an instance of the SbtSingle contract from a configuration object.
     * @param config - The configuration object for the contract.
     * @param workchain - The workchain ID (default is 0).
     * @returns An instance of SbtSingle.
     */
    static async createFromConfig(
        config: SbtSingleData,
        workchain = 0
    ) {

        const data = this.buildDataCell(config)
        const address = contractAddress(
            workchain,
            {
                code: this.code,
                data: data
            }
        )

        return new SbtSingle(
            address,
            {
                code: this.code,
                data: data
            }
        )
    }

    /**
     * Sends a deploy command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the deploy command.
     * @param value - The value sent with the deploy command.
     */
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            body: beginCell().endCell(),
        })
    }

    /**
     * Sends a prove ownership command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the prove ownership command.
     * @param params - The parameters for the prove ownership command, including value, queryId, dest, forwardPayload, and withContent.
     */
    async sendProveOwnership(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
        dest: Address
        forwardPayload?: Cell
        withContent: boolean
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x04ded148, 32)
                .storeUint(params.queryId, 64)
                .storeAddress(params.dest)
                .storeMaybeRef(params.forwardPayload)
                .storeBit(params.withContent)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Sends a request owner command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the request owner command.
     * @param params - The parameters for the request owner command, including value, queryId, dest, forwardPayload, and withContent.
     */
    async sendRequestOwner(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
        dest: Address
        forwardPayload?: Cell
        withContent: boolean
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0xd0c3bfea, 32)
                .storeUint(params.queryId, 64)
                .storeAddress(params.dest)
                .storeMaybeRef(params.forwardPayload)
                .storeBit(params.withContent)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Sends a revoke command to the contract.
     * @param provider - The contract provider.
     * @param via - The sender of the revoke command.
     * @param params - The parameters for the revoke command, including value and queryId.
     */
    async sendRevoke(provider: ContractProvider, via: Sender, params: {
        value: bigint
        queryId: bigint
    }) {
        await provider.internal(via, {
            value: params.value,
            body: beginCell()
                .storeUint(0x6f89f5e3, 32)
                .storeUint(params.queryId, 64)
                .endCell(),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
        })
    }

    /**
     * Retrieves the NFT data from the contract.
     * @param provider - The contract provider.
     * @returns An object containing the NFT data, including init, index, collectionAddress, ownerAddress, and individualContent.
     */
    async getNftData(provider: ContractProvider) {
        const { stack } = await provider.get('get_nft_data', [])
        return {
            init: stack.readBoolean(),
            index: stack.readBigNumber(),
            collectionAddress: stack.readAddressOpt(),
            ownerAddress: stack.readAddressOpt(),
            individualContent: stack.readCellOpt(),
        }
    }

    /**
     * Retrieves the authority address from the contract.
     * @param provider - The contract provider.
     * @returns An object containing the authority address.
     */
    async getAuthorityAddress(provider: ContractProvider) {
        const { stack } = await provider.get('get_authority_address', [])
        return {
            authorityAddress: stack.readAddressOpt(),
        }
    }

    /**
     * Retrieves the time when the contract was revoked.
     * @param provider - The contract provider.
     * @returns An object containing the revoked time.
     */
    async getRevokedTime(provider: ContractProvider) {
        const { stack } = await provider.get('get_revoked_time', [])
        return {
            revoked_time: stack.readBigNumber(),
        }
    }
}

// Utils

/**
 * Represents the data required to create a new SbtSingle contract.
 */
export type SbtSingleData = {
    ownerAddress: Address
    editorAddress: Address
    content: string
    authorityAddress: Address
    revokedAt?: number
}