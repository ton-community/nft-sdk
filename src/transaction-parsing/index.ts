import { Transaction } from "ton-core"

export function parseTransaction<E extends ((input: Transaction) => any)>(tx: Transaction, parsers: E[]): (E extends ((input: Transaction) => infer RR) ? RR : never) | undefined {

    for (const p of parsers) {
        const parsed = p(tx);
        if (parsed !== undefined) return parsed;
    }

    return undefined;
}