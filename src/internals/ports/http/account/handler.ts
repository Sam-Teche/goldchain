import {Request, Response, Router} from "express";
import {SuccessResponse} from "../../../../package/responses/success";
import AccountServices from "../../../services/accounts";
import AdminServices from "../../../services/admin";
import NoteServices from "../../../services/note";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {AccountFilterSchema, MongoIdSchema} from "./validationSchema";
import {AccountFilter} from "../../../domain/account/account";

export default class Handler {
    router: Router;
    accountServices: AccountServices;

    constructor(accountServices: AccountServices) {
        this.accountServices = accountServices;

        this.router = Router();

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").get(
            ValidationMiddleware(AccountFilterSchema, 'query'),
            this.getAccounts
        )


        this.router.route("/:accountId").get(
            ValidationMiddleware(MongoIdSchema, 'params'),
            this.getAccount
        )
    }


    getAccounts = async (req: Request, res: Response) => {
        let filter = req.query as unknown as AccountFilter
        filter.activated = true
        const accounts = await this.accountServices.queries.getAccounts.handle(filter)
        new SuccessResponse(res, {accounts}).send()
    };

    getAccount = async (req: Request, res: Response) => {
        const account = await this.accountServices.queries.getAccount.handle(req.params.accountId)
        new SuccessResponse(res, {account}).send()
    };
};