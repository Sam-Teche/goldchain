import {LedgerRepository} from "../../../domain/ledger/repository";
import {Ledger, LedgerFilter} from "../../../domain/ledger/ledger";

export class GetLedgers {
    ledgerRepository: LedgerRepository;

    constructor(
        ledgerRepository: LedgerRepository,
    ) {
        this.ledgerRepository = ledgerRepository;
    }


    handle = async (filter: LedgerFilter): Promise<Ledger[]> => {
        try {
            return await this.ledgerRepository.GetLedgers(filter)
        } catch (error) {
            throw error;
        }
    };
}
