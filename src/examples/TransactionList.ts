import { Address } from "ton-core";
import { fetchAndParseTransactionData } from "../utils/FetchAndParseTransaction";

async function main() {
    const transactions = await fetchAndParseTransactionData(
        Address.parse("EQCWbV3k8hlLGiFlxPE_RAJDLUpm_WnCCbCxaprvWxh1_AOI"),
        10
    );
    console.log(transactions);
}

main()