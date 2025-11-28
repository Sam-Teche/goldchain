import {AccountModel, Conversation,AddMessageParameter, ConversationParameters, IAttachment, Message} from "./chat";
import Filter from "../../../package/types/filter";

export interface ChatRepository {
    CreateConversation: (parameters:ConversationParameters) => Promise<Conversation>
    GetConversations: (participantId: string, filter: Filter) => Promise<Conversation[]>
    GetConversation: (conversationId: string) => Promise<Conversation>
    GetMessages: (conversationId: string, filter: Filter) => Promise<Message[]>
    AddMessage: (parameter: AddMessageParameter) => Promise<Message>
    MarkMessagesAsRead: (conversationId: string, participantId: string,participantModel: AccountModel) => Promise<void>;
    DeleteConversation: (conversationId: string) => Promise<void>;
}