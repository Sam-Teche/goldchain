import {Request, Response, Router} from "express";
import {
    profileSchema,
    paymentMethodsSchema,
    validateProfileFiles,
    documentsSchema,
    questionsSchema,
    changePasswordSchema, descriptionSchema
} from "./validationSchema";
import AccountServices from "../../../services/accounts";
import {Authorize} from "../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {SuccessResponse} from "../../../../package/responses/success";
import {Multer} from 'multer';
import {MulterConfig} from "../../../../package/utils/multer";
import {BadRequestError} from "../../../../package/errors/customError";
import Filter from "../../../../package/types/filter";
import ReviewServices from "../../../services/review";

export default class ProfileHandler {
    router: Router;
    accountServices: AccountServices;
    reviewServices: ReviewServices;
    multer: Multer

    constructor(accountServices: AccountServices, reviewServices: ReviewServices) {
        this.accountServices = accountServices;
        this.reviewServices = reviewServices;
        this.router = Router();
        this.multer = new MulterConfig(500 * 1024 * 1024).multer

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").get(
            Authorize(this.accountServices),
            this.getAccount
        )

        this.router.route("/analytics").get(
            Authorize(this.accountServices),
            this.getAnalytics
        )

        this.router.route("/reviews").get(
            Authorize(this.accountServices),
            this.getReviews
        )

        this.router.route("/password/change").patch(
            Authorize(this.accountServices),
            ValidationMiddleware(changePasswordSchema, 'body'),
            this.changePassword
        )

        this.router.route("/setup/profile").post(
            Authorize(this.accountServices),
            ValidationMiddleware(profileSchema, 'body'),
            this.setupProfile
        )

        this.router.route("/setup/document").post(
            Authorize(this.accountServices),
            this.multer.fields([
                {name: "identification", maxCount: 1},
                {name: "companyRegistration", maxCount: 1},
                {name: "mineTitle", maxCount: 1},
                {name: "miningLicense", maxCount: 1},
                {name: "buyerCard", maxCount: 1},
                {name: "exportLicense", maxCount: 1},
                {name: "importLicense", maxCount: 1},
                {name: "refineryLicense", maxCount: 1},
            ]),
            ValidationMiddleware(documentsSchema, 'body'),
            this.setupDocument
        )

        this.router.route("/setup/questions").post(
            Authorize(this.accountServices),
            ValidationMiddleware(questionsSchema, 'body'),
            this.setupQuestions
        )

        this.router.route("/setup/payment").post(
            Authorize(this.accountServices),
            ValidationMiddleware(paymentMethodsSchema, 'body'),
            this.setupPayment
        )

        this.router.route("/setup/fee").post(
            Authorize(this.accountServices),
            this.payActivationFee
        )

        this.router.route("/setup/picture").post(
            Authorize(this.accountServices),
            this.multer.single("profilePicture"),
            this.setupProfilePicture
        )

        this.router.route("/setup/description").post(
            Authorize(this.accountServices),
            ValidationMiddleware(descriptionSchema, 'body'),
            this.setupDescription
        )
    }

    setupProfile = async (req: Request, res: Response) => {
        const {
            type, profile,
        } = req.body;

        await this.accountServices.commands.setupAccount.handle({
            accountId: req.account._id,
            type,
            profile,
        })
        new SuccessResponse(res, {message: "profile details saved"}).send()
    };

    setupDocument = async (req: Request, res: Response) => {
        const {
            type,
        } = req.body;

        const {valid, missing} = validateProfileFiles(type, req.files as any);
        if (!valid) {
            throw new BadRequestError(`Missing required file(s): ${missing.join(', ')}`);
        }
        await this.accountServices.commands.setupAccount.handle({
            accountId: req.account._id,
            type,
            files: req.files
        })
        new SuccessResponse(res, {message: "documents uploaded"}).send()
    };

    setupProfilePicture = async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError(`profile picture required`);
        }
        await this.accountServices.commands.setupAccount.handle({
            accountId: req.account._id,
            profilePictureFile: req.file,
            type: req.account.type
        })
        new SuccessResponse(res, {message: "profile picture saved"}).send()
    };

    setupDescription = async (req: Request, res: Response) => {
        const {
            description,
        } = req.body;

        await this.accountServices.commands.setupAccount.handle({
            accountId: req.account._id,
            description,
            type: req.account.type
        })

        new SuccessResponse(res, {message: "description saved"}).send()
    };

    setupQuestions = async (req: Request, res: Response) => {
        const {
            type, questions,
        } = req.body;
        console.log({questions})

        await this.accountServices.commands.setupAccount.handle({accountId: req.account._id, type, questions})
        new SuccessResponse(res, {message: "answers recorded"}).send()
    };

    setupPayment = async (req: Request, res: Response) => {
        const {
            type, paymentMethods,
        } = req.body;

        await this.accountServices.commands.setupAccount.handle({accountId: req.account._id, type, paymentMethods})
        new SuccessResponse(res, {message: "payment method saved"}).send()
    };

    payActivationFee = async (req: Request, res: Response) => {
        const checkoutURL = await this.accountServices.commands.payActivationFee.handle(req.account._id)
        new SuccessResponse(res, {checkoutURL}).send()
    };

    getAccount = async (req: Request, res: Response) => {
        const account = await this.accountServices.queries.getAccount.handle(req.account._id)
        new SuccessResponse(res, {account}).send()
    };

    getAnalytics = async (req: Request, res: Response) => {
        const account = await this.accountServices.queries.analytics.handle(req.account._id)
        new SuccessResponse(res, {account}).send()
    };

    changePassword = async (req: Request, res: Response) => {
        await this.accountServices.commands.changePassword.handle({
            id: req.account._id,
            newPassword: req.body.newPassword,
            oldPassword: req.body.oldPassword
        })
        new SuccessResponse(res, {message: "password changed"}).send()
    };

    getReviews = async (req: Request, res: Response) => {
        let filter = req.query as unknown as Filter
        const reviews = await this.reviewServices.queries.getReviews.handle(
            {
                account: req.account._id,
                ...filter
            }
        )
        new SuccessResponse(res, {reviews}).send()
    };

};
