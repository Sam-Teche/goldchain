import {NoteModel} from "./schema";
import {NoteRepository} from "../../domain/note/repository";
import {Note, NoteReferenceModel} from "../../domain/note/note";
import Filter from "../../../package/types/filter";

export default class NoteClass implements NoteRepository {
    async AddNote(note: Omit<Note, "createdAt" | "_id">): Promise<void> {
        await NoteModel.create({...note})
    };

    async UpdateNote(createdBy: string, noteId: string, content: string): Promise<void> {
        await NoteModel.updateOne({_id: noteId, createdBy}, {content})
    };

    async DeleteNote(createdBy: string, noteId: string): Promise<void> {
        await NoteModel.deleteOne({_id: noteId, createdBy})
    };

    async GetNotes(reference: string, referenceModel: NoteReferenceModel, filter: Filter): Promise<Note[]> {
        const limit = filter.limit || 20;
        const page = filter.page || 1;
        const skip = (page - 1) * limit;

        return await NoteModel.find({reference, referenceModel})
            .skip(skip)
            .limit(limit)
            .sort("-createdAt")
            .lean<Note[]>()
            .exec();
    };
}