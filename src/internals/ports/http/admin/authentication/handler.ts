import { Router, Request, Response } from "express";
import AdminServices from "../../../../services/admin";
import {
  SuccessResponse,
  SuccessResponseWithCookies,
} from "../../../../../package/responses/success";
import Cookie from "../../../../../package/types/cookies";
import {
  AdminStatus,
  IAdmin,
  AdminFilter,
} from "../../../../domain/admin/admin";
import { AuthorizeAdmin } from "../../../../../package/middleware/authorization";
import CheckPermission from "../../../../../package/middleware/permission";
import ValidationMiddleware from "../../../../../package/middleware/validation";
import {
  addAdminSchema,
  authenticateAdminSchema,
  removeAdminSchema,
  updateAdminSchema,
  emailSchema,
  resetPasswordSchema,
  getAdminsSchema,
} from "./validationSchema";

export default class Handler {
  router: Router;
  adminServices: AdminServices;

  constructor(adminServices: AdminServices) {
    this.adminServices = adminServices;
    this.router = Router();

    this.configureRoutes();
  }

  private configureRoutes() {
    this.router
      .route("/")
      .patch(
        AuthorizeAdmin(this.adminServices),
        ValidationMiddleware(updateAdminSchema, "body"),
        this.updateAdmin
      );

    this.router
      .route("/admins")
      .get(
        AuthorizeAdmin(this.adminServices),
        ValidationMiddleware(getAdminsSchema, "query"),
        this.getAdmins
      );

    this.router
      .route("/:id")
      .delete(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("delete_admin"),
        ValidationMiddleware(removeAdminSchema, "params"),
        this.removeAdmin
      );

    this.router
      .route("/add")
      .post(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("add_admin"),
        ValidationMiddleware(addAdminSchema, "body"),
        this.addAdmin
      );

    this.router
      .route("/login")
      .post(
        ValidationMiddleware(authenticateAdminSchema, "body"),
        this.authenticate
      );

    this.router
      .route("/password/forgot")
      .post(ValidationMiddleware(emailSchema, "body"), this.forgotPassword);
    this.router
      .route("/password/reset")
      .post(
        ValidationMiddleware(resetPasswordSchema, "body"),
        this.resetPassword
      );
  }

  addAdmin = async (req: Request, res: Response) => {
    const password = await this.adminServices.commands.addAdmin.handle(
      req.body.email,
      req.body.fullName
    );
    new SuccessResponse(res, { password }, null).send();
  };

  authenticate = async (req: Request, res: Response) => {
    let { admin, token, expires } =
      await this.adminServices.queries.authenticate.handle(
        req.body.email,
        req.body.password,
        req.body.stayLoggedIn
      );
    const cookie: Cookie = {
      key: "adminToken",
      value: token,
    };
    new SuccessResponseWithCookies(res, cookie, { token: token, admin }).send(
      expires
    );
  };

  getAdmins = async (req: Request, res: Response) => {
    const { limit, page, name, email, status } = req.query;
    const filter: AdminFilter = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      searchTerm: name as string,
      email: email as string,
      status: status as AdminStatus,
    };

    const admins = await this.adminServices.queries.getAdmins.handle(filter);

    new SuccessResponse(res, { admins }).send();
  };

  removeAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.adminServices.commands.removeAdmin.handle(id);
    new SuccessResponse(res, { message: "admin deleted" }).send();
  };

  updateAdmin = async (req: Request, res: Response) => {
    const admin: Partial<IAdmin> = {
      status: req.body.status,
      roles: req.body.roles,
    };
    await this.adminServices.commands.updateAdmin.handle(req.admin._id, admin);
    new SuccessResponse(res, { message: "admin updated" }).send();
  };

  forgotPassword = async (req: Request, res: Response) => {
    await this.adminServices.commands.sendOTP.handle(
      req.body.email,
      "resetPassword"
    );
    new SuccessResponse(res, { message: "otp sent" }).send();
  };

  resetPassword = async (req: Request, res: Response) => {
    await this.adminServices.commands.resetPassword.handle(
      req.body.email,
      req.body.password,
      req.body.otp
    );
    new SuccessResponse(res, { message: "password reset" }).send();
  };
}
