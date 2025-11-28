import {Request, Response, Router} from "express";
import AdminServices from "../../../../services/admin";
import ListingServices from "../../../../services/listing";
import ReviewServices from "../../../../services/review";
import {Multer} from "multer";
import {MulterConfig} from "../../../../../package/utils/multer";
import {AuthorizeAdmin} from "../../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../../package/middleware/validation";
import {reviewFilterSchema} from "./validationSchema";
import {SuccessResponse} from "../../../../../package/responses/success";
import {ListingFilter, ReportedListingsFilter} from "../../../../domain/listing/listing";
import Filter from "../../../../../package/types/filter";
import {listingFilterSchema, listingIdSchema} from "../../listing/validationSchema";

export default class Handler {
    router: Router;
    adminServices: AdminServices;
    listingServices: ListingServices
    reviewServices: ReviewServices
    multer: Multer

    constructor(adminServices: AdminServices, listingServices: ListingServices, reviewServices: ReviewServices) {
        this.adminServices = adminServices;
        this.listingServices = listingServices;
        this.reviewServices = reviewServices;
        this.router = Router();
        this.multer = new MulterConfig(500 * 1024 * 1024).multer

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").get(
            AuthorizeAdmin(this.adminServices),
            ValidationMiddleware(listingFilterSchema, 'query'),
            this.getListings
        )

        this.router.route("/report").get(
            AuthorizeAdmin(this.adminServices),
            ValidationMiddleware(listingFilterSchema, 'query'),
            this.getReportedListing
        )

        this.router.route("/:listingId/review").get(
            AuthorizeAdmin(this.adminServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            ValidationMiddleware(reviewFilterSchema, 'query'),
            this.getReviews
        ).delete(
            AuthorizeAdmin(this.adminServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            this.deleteReview
        )


        this.router.route("/:listingId").get(
            AuthorizeAdmin(this.adminServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            this.getListing
        ).delete(
            AuthorizeAdmin(this.adminServices),
            ValidationMiddleware(listingIdSchema, 'params'),
            this.deleteListing
        )
    }


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

    getReportedListing = async (req: Request, res: Response) => {
        let listings = await this.listingServices.queries.getReportedListing.handle(req.query as unknown as ReportedListingsFilter)
        new SuccessResponse(res, {listings}).send()
    };
};
