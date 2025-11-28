import {Request, Response, Router} from "express";
import AccountServices from "../../../services/accounts";
import {Authorize} from "../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {SuccessResponse} from "../../../../package/responses/success";
import ListingServices from "../../../services/listing";
import {MulterConfig} from "../../../../package/utils/multer";
import {Multer} from "multer";
import {
    createReviewSchema,
    listingFilterSchema,
    listingIdSchema,
    listingSchema, reportSchema, reviewFilterSchema,
    validateFiles
} from "./validationSchema";
import {BadRequestError, ForbidenError} from "../../../../package/errors/customError";
import {ListingFilter, ReportedListingsFilter, ReportListingParameters} from "../../../domain/listing/listing";
import ReviewServices from "../../../services/review";
import Filter from "../../../../package/types/filter";

export default class Handler {
    router: Router;
    accountServices: AccountServices;
    listingServices: ListingServices
    reviewServices: ReviewServices
    multer: Multer

    constructor(accountServices: AccountServices, listingServices: ListingServices, reviewServices: ReviewServices) {
        this.accountServices = accountServices;
        this.listingServices = listingServices;
        this.reviewServices = reviewServices;
        this.router = Router();
        this.multer = new MulterConfig(500 * 1024 * 1024).multer

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").post(Authorize(this.accountServices),
            ValidationMiddleware(listingSchema, 'body'),
            this.addListing
        ).get(
            Authorize(this.accountServices),
            ValidationMiddleware(listingFilterSchema, 'query'),
            this.getListings
        )

        this.router.route("/report").post(Authorize(this.accountServices),
            ValidationMiddleware(reportSchema, 'body'),
            this.reportListing
        )

        this.router.route("/:listingId/review").post(
            Authorize(this.accountServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            ValidationMiddleware(createReviewSchema, 'body'),
            this.review
        ).get(
            Authorize(this.accountServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            ValidationMiddleware(reviewFilterSchema, 'query'),
            this.getReviews
        ).delete(
            Authorize(this.accountServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            this.deleteReview
        )


        this.router.route("/:listingId").get(
            Authorize(this.accountServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            this.getListing
        ).delete(
            Authorize(this.accountServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            this.deleteListing
        )
    }


    addListing = async (req: Request, res: Response) => {
        const {
            information,
            questions,
            deliveryMethod,
            deliveryInformation,
            documents,
            signatureUrl
        } = req.body;

        if (req.account.type == "offtaker") {
            throw new ForbidenError("account type cannot create a listing")
        }

        let listingId = await this.listingServices.commands.createListing.handle({
            deliveryInformation,
            deliveryMethod,
            documents,
            signatureUrl,
            information,
            questions,
            accountId: req.account._id,
        })

        new SuccessResponse(res, {listingId}).send()
    };


    getListings = async (req: Request, res: Response) => {
        let filter = req.query as unknown as ListingFilter
        filter.buyerAccountType = req.account.type != "source" ? req.account.type : undefined
        if (req.account.type == "source") filter.seller = filter.seller ? filter.seller : req.account._id
        const listings = await this.listingServices.queries.getListings.handle(filter)
        new SuccessResponse(res, {listings}).send()
    };

    getListing = async (req: Request, res: Response) => {
        const listing = await this.listingServices.queries.getListing.handle(req.params.listingId)
        new SuccessResponse(res, {listing}).send()
    };

    deleteListing = async (req: Request, res: Response) => {
        await this.listingServices.commands.deleteListing.handle(req.params.listingId, req.account._id)
        new SuccessResponse(res, {message: "listing deleted"}).send()
    };

    review = async (req: Request, res: Response) => {
        const {
            rating,
            comment,
        } = req.body;

        let listing
        try {
            listing = await this.listingServices.queries.getListing.handle(req.params.listingId, req.account._id)
        } catch (e) {

        }
        if (listing) throw new ForbidenError("review of own listing not allowed")

        await this.reviewServices.commands.createReview.handle({
            listing: req.params.listingId,
            reviewer: req.account._id,
            rating,
            comment
        })

        new SuccessResponse(res, {message: "review created"}).send()
    }

    getReviews = async (req: Request, res: Response) => {
        let filter = req.query as unknown as Filter
        const reviews = await this.reviewServices.queries.getReviews.handle(
            {
                listing: req.params.listingId,
                ...filter
            }
        )
        new SuccessResponse(res, {reviews}).send()
    };

    deleteReview = async (req: Request, res: Response) => {
        await this.reviewServices.commands.deleteReview.handle(req.params.listingId, req.account._id)
        new SuccessResponse(res, {message: "review deleted"}).send()
    };

    reportListing = async (req: Request, res: Response) => {
        let parameters: ReportListingParameters = {...req.body, reportedBy: req.account._id}
        await this.listingServices.commands.reportListing.handle(parameters)
        new SuccessResponse(res, {message: "Listing reported"}).send()
    };
};
