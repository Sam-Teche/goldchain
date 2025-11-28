import {LedgerRepository} from "../../../domain/ledger/repository";
import {Ledger} from "../../../domain/ledger/ledger";

export class GetLedger {
    ledgerRepository: LedgerRepository;

    constructor(
        ledgerRepository: LedgerRepository,
    ) {
        this.ledgerRepository = ledgerRepository;
    }


    handle = async (ledgerId: string): Promise<Ledger> => {
        try {
            return await this.ledgerRepository.GetLedger(ledgerId)
        } catch (error) {
            throw error;
        }
    };
}
