import {Request, Response, Router} from "express";
import AccountServices from "../../../services/accounts";
import {Authorize} from "../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {SuccessResponse} from "../../../../package/responses/success";
import RequestServices from "../../../services/request";
import {
    listingIdSchema,
    requestFilterSchema,
    requestIdSchema,
    updateStatusSchema
} from "./validationSchema";
import {listingFilterSchema} from "../listing/validationSchema";
import {RequestFilter} from "../../../domain/request/request";
import {ForbidenError} from "../../../../package/errors/customError";
import ListingServices from "../../../services/listing";

export default class Handler {
    router: Router;
    accountServices: AccountServices;
    listingServices: ListingServices;
    requestServices: RequestServices

    constructor(accountServices: AccountServices, listingServices: ListingServices, requestServices: RequestServices) {
        this.accountServices = accountServices;
        this.listingServices = listingServices;
        this.requestServices = requestServices;
        this.router = Router();

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").post(
            Authorize(this.accountServices),
            ValidationMiddleware(listingIdSchema, 'body'),
            this.request
        ).get(
            Authorize(this.accountServices),
            ValidationMiddleware(requestFilterSchema, 'query'),
            this.getRequests
        )

        this.router.route("/listing").get(
            Authorize(this.accountServices),
            ValidationMiddleware(requestFilterSchema, 'query'),
            ValidationMiddleware(listingIdSchema, 'body'),
            this.getListingRequests
        )

        this.router.route("/:requestId").patch(
            Authorize(this.accountServices),
            ValidationMiddleware(requestIdSchema, 'params'),
            ValidationMiddleware(updateStatusSchema, 'body'),
            this.requestStatus
        )
            .get(
                Authorize(this.accountServices),
                ValidationMiddleware(requestIdSchema, 'params'),
                this.getRequest
            )

    }

    request = async (req: Request, res: Response) => {
        await this.requestServices.commands.createRequest.handle(req.account._id, req.body.listingId)
        new SuccessResponse(res, {message: "request sent to seller"}).send()
    };

    requestStatus = async (req: Request, res: Response) => {
        await this.requestServices.commands.updateRequestStatus.handle(req.params.requestId, req.account._id, req.body.status)
        new SuccessResponse(res, {message: `request ${req.body.status}`}).send()
    };

    getRequests = async (req: Request, res: Response) => {
        let filter = req.query as unknown as RequestFilter
        filter.buyer = req.account._id
        let requests = await this.requestServices.queries.getRequests.handle(filter)
        new SuccessResponse(res, {requests}).send()
    };

    getListingRequests = async (req: Request, res: Response) => {
        let filter = req.query as unknown as RequestFilter
        filter.listing = req.body.listingId

        try {
            await this.listingServices.queries.getListing.handle(filter.listing, req.account._id)
        } catch (e) {
            throw new ForbidenError("can not view request of listing")
        }

        let requests = await this.requestServices.queries.getRequests.handle(filter)
        new SuccessResponse(res, {requests}).send()
    };

    getRequest = async (req: Request, res: Response) => {
        let request = await this.requestServices.queries.getRequest.handle(req.params.requestId)
        new SuccessResponse(res, {request}).send()
    };

};
