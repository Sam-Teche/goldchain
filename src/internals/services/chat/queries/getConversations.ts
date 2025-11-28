import {ChatRepository} from "../../../domain/chat/repository";
import {Conversation} from "../../../domain/chat/chat";
import Filter from "../../../../package/types/filter";

export class GetConversations {
    chatRepository: ChatRepository

    constructor(
        chatRepository: ChatRepository
    ) {
        this.chatRepository = chatRepository;
    }


    handle = async (participantId: string, filter: Filter): Promise<Conversation[]> => {
        try {
            return await this.chatRepository.GetConversations(participantId, filter)
        } catch (error) {
            throw error;
        }
    };
}