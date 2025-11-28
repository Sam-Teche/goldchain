import {Request, Response, Router} from "express";
import {SuccessResponse} from "../../../../../package/responses/success";
import {Environment} from "../../../../../package/configs/environment";
import {BadRequestError} from "../../../../../package/errors/customError";
import AccountServices from "../../../../services/accounts";
import Stripe from "stripe";
import LedgerServices from "../../../../services/ledger";

export default class Handler {
    router: Router;
    services: AccountServices;
    environmentVariables: Environment
    ledgerServices: LedgerServices

    constructor(services: AccountServices, environmentVariables: Environment, ledgerServices: LedgerServices) {
        this.services = services;
        this.router = Router();
        this.environmentVariables = environmentVariables
        this.ledgerServices = ledgerServices

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").post(this.process)

    }


    process = async (req: Request, res: Response) => {
        if (req.body.event_type == "transaction") await this.ledgerServices.commands.updateStatus.handle(req.body.event, undefined, req.body.transaction_id)
        return new SuccessResponse(res).send();
    };
};
