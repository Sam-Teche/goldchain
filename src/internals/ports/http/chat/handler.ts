import {Request, Response, Router} from "express";
import AccountServices from "../../../services/accounts";
import {Authorize} from "../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {undefined, z} from "zod";
import {SuccessResponse} from "../../../../package/responses/success";
import {ConversationPaginationSchema, sendMessageSchema, toSchema} from "./validationSchema";
import ChatServices from "../../../services/chat";
import {Multer} from "multer";
import {MulterConfig} from "../../../../package/utils/multer";
import {BadRequestError} from "../../../../package/errors/customError";

import {GetConversationParameter, SendMessageParameter} from "../../../domain/chat/chat";

export default class Handler {
    router: Router;
    accountServices: AccountServices;
    chatServices: ChatServices;
    multer: Multer

    constructor(accountServices: AccountServices, chatServices: ChatServices) {
        this.accountServices = accountServices;
        this.chatServices = chatServices;
        this.router = Router();
        this.multer = new MulterConfig(500 * 1024 * 1024).multer

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").get(Authorize(this.accountServices), ValidationMiddleware(ConversationPaginationSchema, 'query'), this.getConversations)
        this.router.route("/:to/mark").post(Authorize(this.accountServices), ValidationMiddleware(toSchema, 'params'), this.markMessagesAsRead)
        this.router.route("/:to")
            .post(
                Authorize(this.accountServices),
                this.multer.array("attachments", 20),
                ValidationMiddleware(sendMessageSchema, 'body'),
                ValidationMiddleware(toSchema, 'params'),
                this.sendMessage)
            .get(Authorize(this.accountServices), ValidationMiddleware(toSchema, 'params'), this.getMessages)
    }

    sendMessage = async (req: Request, res: Response) => {
        let parameters: SendMessageParameter = {
            content: req.body.content,
            files: req.files as Express.Multer.File[],
            recipientId: req.params.to,
            recipientModel: req.body.accountModel,
            senderId: req.account._id,
            senderModel: "Account"
        }

        let conversationId = await this.chatServices.commands.sendMessage.handle(parameters);
        new SuccessResponse(res, {conversationId}).send()
    };

    getMessages = async (req: Request, res: Response) => {
        let parameters: GetConversationParameter = {
            recipientId: req.params.to,
            recipientModel: "Account",
            senderId: req.account._id,
            senderModel: "Account"
        }
        let {messages,conversation} = await this.chatServices.queries.getMessages.handle(parameters, {
            limit: req
                .query.limit as unknown as number,
            page: req
                .query.page as unknown as number
        });
        new SuccessResponse(res, {messages,conversation}).send()
    };
    getConversations = async (req: Request, res: Response) => {
        let conversations = await this.chatServices.queries.getConversations.handle(req.account._id, {
            limit: req
                .query.limit as unknown as number,
            page: req
                .query.page as unknown as number
        });
        new SuccessResponse(res, {conversations}).send()
    };
    markMessagesAsRead = async (req: Request, res: Response) => {
        let parameters: GetConversationParameter = {
            recipientId: req.params.to,
            recipientModel: req.body.accountModel,
            senderId: req.account._id,
            senderModel: "Account"
        }
        await this.chatServices.commands.markMessageAsRead.handle(parameters);
        new SuccessResponse(res, {message: "all messages marked as read"}).send()
    };
};
