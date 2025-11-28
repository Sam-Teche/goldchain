import {LedgerRepository} from "../../../domain/ledger/repository";
import {EmailRepository} from "../../../domain/notification/repository";
import {Environment} from "../../../../package/configs/environment";
import {EscrowRepository} from "../../../domain/escrow/repository";
import {BadRequestError} from "../../../../package/errors/customError";


export class Cancel {
    ledgerRepository: LedgerRepository;
    escrowRepository: EscrowRepository;
    environmentVariables: Environment;
    emailRepository: EmailRepository

    constructor(
        ledgerRepository: LedgerRepository,
        escrowRepository: EscrowRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.ledgerRepository = ledgerRepository;
        this.escrowRepository = escrowRepository;
        this.environmentVariables = environmentVariables;
        this.emailRepository = emailRepository;
    }


    handle = async (ledgerId: string, reason: string,): Promise<void> => {
        let ledger = await this.ledgerRepository.GetLedger(ledgerId)

        if (ledger.status == "completed" || ledger.status == "cancelled") throw new BadRequestError("only admin can cancel this order");

        await this.escrowRepository.cancelTransaction(ledger.reference, reason)
        await this.ledgerRepository.UpdateLedger(ledger._id, {status: "cancelled"})
    };
}
