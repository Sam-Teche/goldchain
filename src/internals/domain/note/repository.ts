import {Note, NoteReferenceModel} from "./note";
import Filter from "../../../package/types/filter";


export interface NoteRepository {
    AddNote: (note: Omit<Note, "createdAt" | "_id">) => Promise<void>
    UpdateNote: (createdBy: string, noteId: string, content: string) => Promise<void>
    DeleteNote: (createdBy: string, noteId: string) => Promise<void>
    GetNotes: (reference: string, referenceModel: NoteReferenceModel, filter: Filter) => Promise<Note[]>
}