export type NoteReferenceModel = 'Account' | 'Order'; // OTP

export interface INote {
    reference: string;
    referenceModel: NoteReferenceModel;
    content: string;
    createdBy: string;
    createdAt: Date;
}

export type Note = INote & { _id: string }