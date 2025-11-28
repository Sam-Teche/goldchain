import {ChatRepository} from "../../../domain/chat/repository";
import {GetConversationParameter} from "../../../domain/chat/chat";

export class MarkMessagesAsRead {
    chatRepository: ChatRepository

    constructor(
        chatRepository: ChatRepository
    ) {
        this.chatRepository = chatRepository;
    }


    handle = async (parameter: GetConversationParameter): Promise<void> => {
        let conversation = await this.chatRepository.CreateConversation(
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
        await this.chatRepository.MarkMessagesAsRead(conversation._id, parameter.senderId, parameter.senderModel)
    };
}