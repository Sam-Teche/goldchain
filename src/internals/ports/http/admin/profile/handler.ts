import {Router, Request, Response} from "express";
import AdminServices from "../../../../services/admin";
import {Multer} from "multer";
import {MulterConfig} from "../../../../../package/utils/multer";
import {AuthorizeAdmin} from "../../../../../package/middleware/authorization";
import {SuccessResponse} from "../../../../../package/responses/success";
import ValidationMiddleware from "../../../../../package/middleware/validation";
import {changePasswordSchema} from "./validationSchema";
import {BadRequestError} from "../../../../../package/errors/customError";

export default class ProfileHandler {
    router: Router;
    adminServices: AdminServices;
    multer: Multer

    constructor(adminServices: AdminServices) {
        this.adminServices = adminServices;
        this.router = Router();
        this.multer = new MulterConfig(500 * 1024 * 1024).multer

        this.configureRoutes()
    }

    private configureRoutes() {
        this.router.route("/").get(
            AuthorizeAdmin(this.adminServices),
            this.getAdmin
        )

        this.router.route("/setup/picture").post(
            AuthorizeAdmin(this.adminServices),
            this.multer.single("profilePicture"),
            this.setupProfilePicture
        )

        this.router
            .route("/password/change")
            .patch(
                AuthorizeAdmin(this.adminServices),
                ValidationMiddleware(changePasswordSchema, "body"),
                this.changePassword
            );
    }


    getAdmin = async (req: Request, res: Response) => {
        const admin = await this.adminServices.queries.getAdmin.handle(req.admin._id)
        new SuccessResponse(res, {admin}).send()
    };

    changePassword = async (req: Request, res: Response) => {
        const {oldPassword, newPassword} = req.body
        await this.adminServices.commands.changePassword.handle({id: req.admin._id, oldPassword, newPassword})
        new SuccessResponse(res, {message: "password changed"}).send();
    }

    setupProfilePicture = async (req: Request, res: Response) => {
        if (!req.file) {
            throw new BadRequestError(`profile picture required`);
        }
        await this.adminServices.commands.setProfilePicture.handle(
            req.admin._id,
            req.file,
        )
        new SuccessResponse(res, {message: "profile picture saved"}).send()
    }

};
