import mongoose, {Document, Schema} from "mongoose";
import {INote} from "../../domain/note/note";

export interface INoteDocument extends INote, Document {
}

const NoteSchema = new Schema({
        reference: {type: Schema.Types.ObjectId, required: true, index: true, refPath: 'referenceModel'},
        referenceModel: {type: String, required: true, enum: ['Account', 'Order']},
        content: {type: String, required: true},
        createdBy: {type: Schema.Types.ObjectId, required: true, index: true, ref: 'Admin'},
        createdAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
    }
);

export const NoteModel = mongoose.model<INoteDocument>('Note', NoteSchema);

