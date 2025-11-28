import Filter from "../../../package/types/filter";
import {
    ConversationParameters,
    Conversation,
    Message,
    Attachment,
    AccountModel, AddMessageParameter
} from "../../domain/chat/chat";
import {ChatRepository} from "../../domain/chat/repository";
import {AttachmentModel, ConversationModel, MessageModel} from "./schema";
import {BadRequestError, NotFoundError} from "../../../package/errors/customError";
import mongoose, {Types} from "mongoose";
import {populate} from "dotenv";
import {Account} from "../../domain/account/account";
import {Admin} from "../../domain/admin/admin";
import {AccountModel as AccountModelS} from "../account/schema"
import {AdminModel} from "../admin/schema";

export default class ChatClass implements ChatRepository {

    async CreateConversation(parameters: ConversationParameters): Promise<Conversation> {
        if (parameters.length < 2) throw new BadRequestError("2 participants needed")
        console.log({parameters})
        // Fix: Query the participants array properly using elemMatch
        const existingConversation = await ConversationModel.findOne({
            $and: [
                {
                    participants: {
                        $elemMatch: {
                            participant: parameters[0].participant,
                            participantModel: parameters[0].participantModel
                        }
                    }
                },
                {
                    participants: {
                        $elemMatch: {
                            participant: parameters[1].participant,
                            participantModel: parameters[1].participantModel
                        }
                    }
                }
            ]
        }).exec();

        if (existingConversation) {
            return existingConversation.toObject() as Conversation;
        }

        const conversation = new ConversationModel({
            participants: parameters,
            unreadCount: new Map([
                [parameters[0].participant, 0],
                [parameters[1].participant, 0]
            ])
        });

        const savedConversation = await conversation.save();
        return savedConversation.toObject() as Conversation;
    }

    async GetConversations(participantId: string, filter: Filter): Promise<Conversation[]> {
        const limit = Number(filter.limit) || 20;
        const page = Number(filter.page) || 1;
        const skip = (page - 1) * limit;

        const conversations = await ConversationModel.aggregate([
            {
                $match: {
                    'participants.participant': new mongoose.Types.ObjectId(participantId)
                }
            },

            // Lookup lastMessage with selected fields
            {
                $lookup: {
                    from: 'messages',
                    localField: 'lastMessage',
                    foreignField: '_id',
                    as: 'lastMessage',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                content: 1,
                                createdAt: 1,
                                messageType: 1,
                                sender: 1,
                                attachments: 1
                            }
                        }
                    ]
                }
            },

            {
                $unwind: {
                    path: '$lastMessage',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Lookup attachments full info
            {
                $lookup: {
                    from: 'attachments', // Replace with your actual attachments collection name
                    localField: 'lastMessage.attachments',
                    foreignField: '_id',
                    as: 'lastMessage.attachments',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                filename: 1,
                                originalName: 1,
                                mimeType: 1,
                                size: 1,
                                url: 1
                                // Add other attachment fields you need
                            }
                        }
                    ]
                }
            },

            {
                $unwind: '$participants'
            },

            // Account lookup - select only needed fields
            {
                $lookup: {
                    from: 'accounts',
                    let: {
                        participantId: '$participants.participant',
                        participantModel: '$participants.participantModel'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ['$_id', '$$participantId']},
                                        {$eq: ['$$participantModel', 'Account']}
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                profile: 1,
                                profilePicture: 1,
                                description: 1,
                            }
                        }
                    ],
                    as: 'accountData'
                }
            },

            {
                $lookup: {
                    from: 'admins',
                    let: {
                        participantId: '$participants.participant',
                        participantModel: '$participants.participantModel'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ['$_id', '$$participantId']},
                                        {$eq: ['$$participantModel', 'Admin']}
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                fullName: 1,
                                profilePicture: 1
                            }
                        }
                    ],
                    as: 'adminData'
                }
            },

            {
                $addFields: {
                    'participants.participantData': {
                        $cond: {
                            if: {$eq: ['$participants.participantModel', 'Account']},
                            then: {$arrayElemAt: ['$accountData', 0]},
                            else: {$arrayElemAt: ['$adminData', 0]}
                        }
                    }
                }
            },

            {
                $project: {
                    accountData: 0,
                    adminData: 0
                }
            },

            {
                $group: {
                    _id: '$_id',
                    participants: {$push: '$participants'},
                    lastMessage: {$first: '$lastMessage'},
                    unreadCount: {$first: '$unreadCount'},
                    createdAt: {$first: '$createdAt'},
                    updatedAt: {$first: '$updatedAt'}
                }
            },

            {$sort: {updatedAt: -1}},
            {$skip: skip},
            {$limit: limit}
        ]);

        return conversations as Conversation[];
    }

    async GetConversation(conversationId: string): Promise<Conversation> {
        let conversation = await ConversationModel
            .findOne({_id: conversationId})
            .select('participants')
            .lean<Conversation>()
            .exec();
        if (!conversation) throw new NotFoundError("conversation does not exist")

        let participantOne: Account | Admin | null = conversation.participants[0].participantModel == "Account" ?
            await AccountModelS.findOne({_id: conversation.participants[0].participant})
                .select("_id profile profilePicture description")
                .lean<Account>()
                .exec()
            :
            await AdminModel.findOne({_id: conversation.participants[0].participant})
                .select("_id fullName profilePicture").lean<Admin>().exec()

        let participantTwo: Account | Admin | null = conversation.participants[1].participantModel == "Account" ?
            await AccountModelS.findOne({_id: conversation.participants[1].participant})
                .select("_id profile profilePicture description")
                .lean<Account>()
                .exec()
            :
            await AdminModel.findOne({_id: conversation.participants[1].participant})
                .select("_id fullName profilePicture")
                .lean<Admin>()
                .exec()
        let convo = {...conversation}
        convo.participants = [];
        convo.participants[0] = {
            participant: participantOne as Admin | Account,
            participantModel: conversation.participants[0].participantModel
        }
        convo.participants[1] = {
            participant: participantTwo as Admin | Account,
            participantModel: conversation.participants[1].participantModel
        }

        return convo as Conversation;
    }

    async GetMessages(conversationId: string, filter: Filter): Promise<Message[]> {
        const limit = Number(filter.limit) || 20;
        const page = Number(filter.page) || 1;
        const skip = (page - 1) * limit;


        // First verify the conversation exists
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const messages = await MessageModel
            .find({
                conversation: conversationId
            })
            .populate('sender', "profile profilePicture")
            .populate('attachments')
            .skip(skip)
            .limit(limit)
            .exec();

        return messages.map(msg => msg.toObject() as Message);
    }

    async AddMessage(parameter: AddMessageParameter): Promise<Message> {
        const conversation = await ConversationModel.findById(parameter.conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        if (!parameter.content && (!parameter.attachments || parameter.attachments.length === 0)) {
            throw new Error('Message must have either content or attachments');
        }

        let savedAttachments: Attachment[] = [];
        if (parameter.attachments && parameter.attachments.length > 0) {
            const attachmentPromises = parameter.attachments.map(async (attachment) => {
                const attachmentDoc = new AttachmentModel(attachment);
                const savedAttachment = await attachmentDoc.save();
                return savedAttachment.toObject() as Attachment;
            });
            savedAttachments = await Promise.all(attachmentPromises);
        }

        // Determine message type
        let messageType: 'text' | 'image' | 'file' | 'mixed' = 'text';
        if (savedAttachments.length > 0) {
            const hasImages = savedAttachments.some(att => att.mimeType.startsWith('image/'));
            const hasFiles = savedAttachments.some(att => !att.mimeType.startsWith('image/'));

            if (parameter.content) {
                messageType = 'mixed';
            } else if (hasImages && !hasFiles) {
                messageType = 'image';
            } else {
                messageType = 'file';
            }
        }

        const message = new MessageModel({
            conversation: conversation._id,
            content: parameter.content || '',
            sender: parameter.senderId,
            senderModel: parameter.senderModel,
            attachments: savedAttachments.map(att => att._id),
            messageType,
            isRead: false
        });

        const savedMessage = await message.save();
        // Update conversation
        conversation.lastMessage = savedMessage._id as string;
        conversation.participants.forEach(participant => {
            const participantId = participant.participant.toString();
            if (participantId != parameter.senderId) {
                const currentCount = conversation.unreadCount.get(participantId) || 0;
                conversation.unreadCount.set(participantId, currentCount + 1);
            }
        });

        await conversation.save();

        const messageWithAttachments = savedMessage.toObject() as Message;
        messageWithAttachments.attachments = savedAttachments;

        return messageWithAttachments;
    }

    async MarkMessagesAsRead(conversationId: string, participantId: string, participantModel: AccountModel): Promise<void> {
        await MessageModel.updateMany(
            {
                conversationId: conversationId,
                sender: {$ne: participantId}
            },
            {
                $addToSet: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        const conversation = await ConversationModel.findById(conversationId);
        if (conversation) {
            conversation.unreadCount.set(participantId, 0);
            await conversation.save();
        }
    }

    async DeleteConversation(conversationId: string): Promise<void> {
        await MessageModel.deleteMany({conversationId: new Types.ObjectId(conversationId)});
        await ConversationModel.findByIdAndDelete(conversationId);
    }
}
