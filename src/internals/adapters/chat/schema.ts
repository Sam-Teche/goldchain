import mongoose, {Document, Model, Schema} from "mongoose";
import {IAttachment, IConversation, IMessage} from "../../domain/chat/chat";
import {AccountModel} from "../account/schema";

export interface IAttachmentDocument extends IAttachment, Document {
}

export type IAttachmentModel = Model<IAttachmentDocument>;

const AttachmentSchema = new Schema<IAttachmentDocument>(
    {
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);
export const AttachmentModel = mongoose.model<IAttachmentDocument, IAttachmentModel>("Attachment", AttachmentSchema);


export interface IMessageDocument extends IMessage, Document {

}

export type IMessageModel = Model<IMessageDocument>;

const MessageSchema = new Schema<IMessageDocument>(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Conversation'
        },
        content: {
            type: String,
            required: function () {
                return this.attachments.length === 0;
            },
        },
        sender: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'senderModel'
        },
        senderModel: {
            type: String,
            required: true,
            enum: ['Account', 'Admin']
        },
        attachments: [{
            type: Schema.Types.ObjectId,
            ref: 'Attachment'
        }],
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: null
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file', 'mixed'],
            default: 'text'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
);
export const MessageModel = mongoose.model<IMessageDocument, IMessageModel>("Message", MessageSchema);


export interface IConversationDocument extends IConversation, Document {

}

export type IConversationModel = Model<IConversationDocument>;
const participantSchema = new Schema({
    participant: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'participants.participantModel'
    },
    participantModel: {
        type: String,
        required: true,
        enum: ["Account", "Admin"]
    }
}, {_id: false});

const ConversationSchema = new Schema<IConversationDocument>(
    {
        participants: {
            type: [participantSchema],
            required: true,
            validate: {
                validator: function (participants: any[]) {
                    return participants && participants.length >= 1;
                },
                message: 'Conversation must have at least one participant'
            }
        },
        lastMessage: {
            type: Schema.Types.Mixed, // Can be ObjectId or string
            ref: 'Message'
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: new Map()
        }
    },
    {
        timestamps: true,
    }
);


export const ConversationModel = mongoose.model<IConversationDocument, IConversationModel>("Conversation", ConversationSchema);


