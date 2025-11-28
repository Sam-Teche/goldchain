import {
    NoteRepository
} from "../../../domain/note/repository";
import {EmailParameters, EmailType} from "../../../domain/notification/email";
import {Environment} from "../../../../package/configs/environment";
import {EmailRepository} from "../../../domain/notification/repository";
import {AccountRepository} from "../../../domain/account/repository";
import {AdminRepository} from "../../../domain/admin/repository";
import sendAccountNote from "../../../../package/view/sendAccountNote";

export class AddNote {
    noteRepository: NoteRepository;
    accountRepository: AccountRepository;
    adminRepository: AdminRepository;
    environmentVariables: Environment
    emailRepository: EmailRepository

    constructor(
        noteRepository: NoteRepository,
        accountRepository: AccountRepository,
        adminRepository: AdminRepository,
        environmentVariables: Environment,
        emailRepository: EmailRepository
    ) {
        this.noteRepository = noteRepository;
        this.accountRepository = accountRepository;
        this.adminRepository = adminRepository;
        this.environmentVariables = environmentVariables
        this.emailRepository = emailRepository

    }


    handle = async (accountId: string, adminId: string, note: string): Promise<void> => {
        try {
            let account = await this.accountRepository.GetAccount(accountId);
            let admin = await this.adminRepository.GetAdmin(adminId);

            await this.noteRepository.AddNote({
                reference: account._id,
                referenceModel: "Account",
                content: note,
                createdBy: admin._id
            })
            const emailParameters: EmailParameters = {
                type: EmailType.HTML,
                subject: "Account Note",
                email: account.email,
                message: sendAccountNote(note, this.environmentVariables.supportEmail),
            };

            try {
                this.emailRepository.send(emailParameters).catch();
            } catch (e) {
                // console.log(e)
            }

        } catch (error) {
            throw error;
        }
    };
}

