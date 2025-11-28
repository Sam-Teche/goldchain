import {NoteRepository} from "../../../domain/note/repository";
import {Note, NoteReferenceModel} from "../../../domain/note/note";
import Filter from "../../../../package/types/filter";

export class GetNotes {
    noteRepository: NoteRepository;

    constructor(
        noteRepository: NoteRepository,
    ) {
        this.noteRepository = noteRepository;
    }


    handle = async (reference: string, referenceModel: NoteReferenceModel, filter: Filter): Promise<Note[]> => {
        try {
            return await this.noteRepository.GetNotes(reference, referenceModel, filter)
        } catch (error) {
            throw error;
        }
    };
}
