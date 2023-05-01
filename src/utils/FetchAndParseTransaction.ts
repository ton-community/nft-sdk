import { Address, Cell, Slice } from "ton-core";
import {TonAPI} from "../ton-api"
import { parseTransactionData } from "./parseTransaction";

export async function fetchAndParseTransactionData(
    account: Address,
    limit: number
) {
    const tonApi = new TonAPI();

    const transactions: any = await tonApi.getTransactionsByAddress(
        account,
        limit
    );

    let transactions_data: Array<any> = [];
    for (let i = 0; i < transactions.transactions.length; i++) {
        const transaction = transactions.transactions[i];

        const parsedTransaction = await parseTransactionData(
            Cell.fromBoc(Buffer.from(transaction.data,'hex'))[0].beginParse()
        );

        transactions_data.push(parsedTransaction);
    }

    return transactions_data;
}