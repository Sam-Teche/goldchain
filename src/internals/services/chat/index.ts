import {Environment} from "../../../package/configs/environment";
import {ChatRepository} from "../../domain/chat/repository";
import {GetConversations} from "./queries/getConversations";
import {GetMessages} from "./queries/getMessages";
import {MarkMessagesAsRead} from "./command/markMessageAsRead";
import {SendMessage} from "./command/sendMessage";
import {StorageRepository} from "../../domain/storage/repository";
import {Authorized} from "./queries/authorized";
import {ChatWebsocketRepository} from "../../domain/websocket/repository";

class Commands {
    sendMessage: SendMessage
    markMessageAsRead: MarkMessagesAsRead

    constructor(chatRepository: ChatRepository, storageRepository: StorageRepository, environmentVariables: Environment, chatWebsocketRepository: ChatWebsocketRepository) {
        this.sendMessage = new SendMessage(chatRepository, environmentVariables, storageRepository, chatWebsocketRepository)
        this.markMessageAsRead = new MarkMessagesAsRead(chatRepository)
    }
}

class Queries {
    authorized: Authorized
    getMessages: GetMessages
    getConversations: GetConversations

    constructor(chatRepository: ChatRepository) {
        this.authorized = new Authorized(chatRepository)
        this.getMessages = new GetMessages(chatRepository)
        this.getConversations = new GetConversations(chatRepository)
    }
}

class ChatServices {
    commands: Commands
    queries: Queries

    constructor(chatRepository: ChatRepository, environmentVariables: Environment, storageRepository: StorageRepository, chatWebsocketRepository: ChatWebsocketRepository) {
        this.commands = new Commands(chatRepository, storageRepository, environmentVariables, chatWebsocketRepository)
        this.queries = new Queries(chatRepository)
    }
}

export default ChatServices