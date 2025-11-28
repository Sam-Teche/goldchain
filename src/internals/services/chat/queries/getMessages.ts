import {ChatRepository} from "../../../domain/chat/repository";
import Filter from "../../../../package/types/filter";
import {Conversation, GetConversationParameter, Message} from "../../../domain/chat/chat";

export class GetMessages {
    chatRepository: ChatRepository

    constructor(
        chatRepository: ChatRepository
    ) {
        this.chatRepository = chatRepository;
    }


    handle = async (parameter: GetConversationParameter, filter: Filter): Promise<{
        messages: Message[],
        conversation: Conversation
    }> => {
        let newConversation = await this.chatRepository.CreateConversation(
            [
                {
                    participant: parameter.senderId,
                    participantModel: parameter.senderModel
                },
                {
                    participant: parameter.recipientId,
                    participantModel: parameter.recipientModel
                }
            ]
        )
        let conversation = await this.chatRepository.GetConversation(newConversation._id)

        let messages = await this.chatRepository.GetMessages(newConversation._id, filter)

        return {messages, conversation}
    };
}