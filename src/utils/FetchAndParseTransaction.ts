import { Address, Cell, Slice } from "ton-core";
import {TonClient} from "../ton-api"
import { Info, parseTransactionData } from "./parseTransaction";

export async function fetchAndParseTransactionData(
    account: Address,
    limit: number
) {
    const tonClient = new TonClient();

    const transactions: any = await tonClient.getTransactionsByAddress(
        account,
        limit
    );

    let transactions_data: Array<Info> = [];
    for (let i = 0; i < transactions.transactions.length; i++) {
        const transaction = transactions.transactions[i];

        const parsedTransaction = await parseTransactionData(
            Cell.fromBoc(Buffer.from(transaction.data,'hex'))[0].beginParse()
        );

        transactions_data.push(parsedTransaction);
    }

    return transactions_data;
}