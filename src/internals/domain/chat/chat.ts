import {Account} from "../account/account";
import {Admin} from "../admin/admin";
import ID from "../../../package/types/ID";

export type AccountModel = 'Account' | 'Admin'; // OTP

export interface IAttachment {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Attachment = IAttachment & ID

export interface IMessage {
    conversation: string | Conversation
    content: string;
    sender: string | Account | Admin;
    senderModel: AccountModel
    attachments: (string | Attachment)[];
    isRead: boolean;
    readAt?: Date;
    messageType: 'text' | 'image' | 'file' | 'mixed';
    createdAt: Date;
    updatedAt: Date;
}

export type Message = IMessage & ID

export interface IConversation {
    participants: ConversationParameters;
    lastMessage: string | Message;
    unreadCount: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

export type Conversation = IConversation & ID

export type ConversationParameters = { participant: string | Account | Admin, participantModel: AccountModel }[]

export type AddMessageParameter = {
    conversationId: string,
    senderId: string,
    senderModel: AccountModel,
    content?: string,
    attachments?: IAttachment[]
}
export type GetConversationParameter = {
    senderId: string,
    senderModel: AccountModel,
    recipientId: string,
    recipientModel: AccountModel,
}
export type SendMessageParameter = {
    senderId: string,
    senderModel: AccountModel,
    recipientId: string,
    recipientModel: AccountModel,
    content?: string,
    files?: Express.Multer.File[]
}