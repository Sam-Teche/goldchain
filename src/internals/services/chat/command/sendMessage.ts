import { SendMessageParameter } from "../../../domain/chat/chat";
import { ChatRepository } from "../../../domain/chat/repository";
import { Environment } from "../../../../package/configs/environment";
import { StorageRepository } from "../../../domain/storage/repository";
import { v4 } from "uuid";
import { BadRequestError } from "../../../../package/errors/customError";
import { ChatWebsocketRepository } from "../../../domain/websocket/repository";

export class SendMessage {
  chatRepository: ChatRepository;
  environmentVariables: Environment;
  storageRepository: StorageRepository;
  chatWebsocketRepository: ChatWebsocketRepository;

  constructor(
    chatRepository: ChatRepository,
    environmentVariables: Environment,
    storageRepository: StorageRepository,
    chatWebsocketRepository: ChatWebsocketRepository
  ) {
    this.chatRepository = chatRepository;
    this.environmentVariables = environmentVariables;
    this.storageRepository = storageRepository;
    this.chatWebsocketRepository = chatWebsocketRepository;
  }

  handle = async (parameter: SendMessageParameter): Promise<string> => {
    if (parameter.senderId == parameter.recipientId) {
      throw new BadRequestError("can't send message to self");
    }
    let conversation = await this.chatRepository.CreateConversation([
      {
        participant: parameter.senderId,
        participantModel: parameter.senderModel,
      },
      {
        participant: parameter.recipientId,
        participantModel: parameter.recipientModel,
      },
    ]);
    let attachments;
    if (parameter.files) {
      attachments = await this.storageRepository.uploadAttachments(
        parameter.files,
        this.environmentVariables.awsCredentials.s3BucketName,
        v4()
      );
    }

    let message = await this.chatRepository.AddMessage({
      conversationId: conversation._id,
      senderId: parameter.senderId,
      senderModel: parameter.senderModel,
      content: parameter.content,
      attachments,
    });

    this.chatWebsocketRepository.Broadcast(
      {
        data: message,
        type: "message",
      },
      conversation._id
    );
    return conversation._id;
  };
}
