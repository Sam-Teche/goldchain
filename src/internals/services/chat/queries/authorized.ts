import {ChatRepository} from "../../../domain/chat/repository";
import Filter from "../../../../package/types/filter";
import {Conversation} from "../../../domain/chat/chat";
import {Admin} from "../../../domain/admin/admin";
import {Account} from "../../../domain/account/account";

export class Authorized {
    chatRepository: ChatRepository

    constructor(
        chatRepository: ChatRepository
    ) {
        this.chatRepository = chatRepository;
    }


    handle = async (conversationId: string, participantId: string, isAdmin?: boolean): Promise<boolean> => {
        let conversation = await this.chatRepository.GetConversation(conversationId);
        for (const {participant} of conversation.participants) {
            if (isAdmin) {
                let admin = participant as Admin
                if (admin._id.toString() == participantId.toString()) return true
            } else {
                let account = participant as Account
                if (account._id.toString() == participantId.toString()) return true
            }
        }
        return false
    };
}