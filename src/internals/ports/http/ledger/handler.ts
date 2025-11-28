import {Request, Response, Router} from "express";
import AccountServices from "../../../services/accounts";
import {Authorize} from "../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {z} from "zod";
import {SuccessResponse} from "../../../../package/responses/success";
import LedgerServices from "../../../services/ledger";
import {LedgerFilter} from "../../../domain/ledger/ledger";
import {ledgerFilterSchema} from "./validationSchema";

export default class Handler {
    router: Router;
    accountServices: AccountServices;
    ledgerServices: LedgerServices;

    constructor(accountServices: AccountServices, ledgerServices: LedgerServices) {
        this.accountServices = accountServices;
        this.ledgerServices = ledgerServices;
        this.router = Router();

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/")
            .post(Authorize(this.accountServices), ValidationMiddleware(
                z.object({
                    offerId: z.string().optional(),
                    requestId: z.string().optional()
                }), 'body'), this.completePurchase)
            .get(
                Authorize(this.accountServices),
                ValidationMiddleware(ledgerFilterSchema, 'query'),
                this.getLedgers
            )

        this.router.route("/:ledgerId/cancel").patch(
            Authorize(this.accountServices),
            ValidationMiddleware(z.object({
                ledgerId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
                    message: "invalid listing",
                }),
            }), 'params'),
            ValidationMiddleware(z.object({
                reason: z.string({message: "reason is required"}).min(1, "reason is required"),
            }), 'body'),
            this.cancelLedger
        )

        this.router.route("/:ledgerId").get(
            Authorize(this.accountServices),
            ValidationMiddleware(z.object({
                ledgerId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
                    message: "invalid listing",
                }),
            }), 'params'),
            this.getLedger
        )
    }


    completePurchase = async (req: Request, res: Response) => {
        let ledger = await this.ledgerServices.commands.completePurchase.handle(req.account._id, req.body.offerId, req.body.requestId)
        new SuccessResponse(res, {ledger}).send()
    };

    getLedgers = async (req: Request, res: Response) => {
        let filter = req.query as unknown as LedgerFilter
        filter.account = req.account._id
        const ledgers = await this.ledgerServices.queries.getLedgers.handle(filter)
        new SuccessResponse(res, {ledgers}).send()
    };

    getLedger = async (req: Request, res: Response) => {
        const ledger = await this.ledgerServices.queries.getLedger.handle(req.params.ledgerId)
        new SuccessResponse(res, {ledger}).send()
    };

    cancelLedger = async (req: Request, res: Response) => {
        await this.ledgerServices.commands.cancel.handle(req.params.ledgerId, req.body.reason)
        new SuccessResponse(res, {message: "ledger canceled"}).send()
    };

};
