export function isEligibleTransaction(tx: any): boolean {
    return (
      tx.inMessage?.info.type == "internal" &&
      tx.description.type == "generic" &&
      tx.description.computePhase.type == "vm"
    );
  }