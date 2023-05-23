import { Transaction } from 'ton-core'

export function isEligibleTransaction(tx: Transaction): boolean {
    return (
        tx.inMessage?.info.type == 'internal' &&
        tx.description.type == 'generic' &&
        tx.description.computePhase.type == 'vm' &&
        tx.description.computePhase.exitCode == 0
    )
}