import {AccountRepository} from "../../domain/account/repository";
import {Environment} from "../../../package/configs/environment";
import {EmailRepository} from "../../domain/notification/repository";
import {AddNote} from "./command/addNote";
import {AdminRepository} from "../../domain/admin/repository";
import {NoteRepository} from "../../domain/note/repository";
import {GetNotes} from "./queries/getNotes";

class Commands {
    addNote: AddNote

    constructor(noteRepository: NoteRepository, accountRepository: AccountRepository, adminRepository: AdminRepository, environmentVariables: Environment, emailRepository: EmailRepository) {
        this.addNote = new AddNote(noteRepository, accountRepository, adminRepository, environmentVariables, emailRepository)
    }
}

class Queries {
    getNotes: GetNotes

    constructor(noteRepository: NoteRepository, accountRepository: AccountRepository, adminRepository: AdminRepository) {
        this.getNotes = new GetNotes(noteRepository)
    }
}

class NoteServices {
    commands: Commands
    queries: Queries

    constructor(noteRepository: NoteRepository, accountRepository: AccountRepository, adminRepository: AdminRepository, environmentVariables: Environment, emailRepository: EmailRepository) {
        this.commands = new Commands(noteRepository, accountRepository, adminRepository, environmentVariables, emailRepository)
        this.queries = new Queries(noteRepository, accountRepository, adminRepository)
    }
}

export default NoteServices