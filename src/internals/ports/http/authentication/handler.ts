import { Request, Response, Router } from "express";
import {
  loginSchema,
  emailSchema,
  signupSchema,
  verifyEmailSchema,
  resetPasswordSchema,
} from "./validationSchema";
import AccountServices from "../../../services/accounts";
import { Authorize } from "../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../package/middleware/validation";
import {
  SuccessResponse,
  SuccessResponseWithCookies,
} from "../../../../package/responses/success";
import Cookie from "../../../../package/types/cookies";

export default class AuthenticationHandler {
  router: Router;
  accountServices: AccountServices;

  constructor(accountServices: AccountServices) {
    this.accountServices = accountServices;
    this.router = Router();

    this.configureRoutes();
  }

  private configureRoutes() {
    this.router
      .route("/signup")
      .post(ValidationMiddleware(signupSchema, "body"), this.signup);
    this.router
      .route("/login")
      .post(ValidationMiddleware(loginSchema, "body"), this.login);
    this.router
      .route("/verify/email")
      .post(ValidationMiddleware(verifyEmailSchema, "body"), this.verifyEmail);
    this.router
      .route("/verify/resend")
      .post(
        ValidationMiddleware(emailSchema, "body"),
        this.resendVerificationOTP
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

  signup = async (req: Request, res: Response) => {
    const token = await this.accountServices.commands.createAccount.handle(
      req.body.email,
      req.body.password
    );
    const cookie: Cookie = {
      key: "token",
      value: token,
    };
    new SuccessResponseWithCookies(res, cookie, { token: token }).send();
  };

  login = async (req: Request, res: Response) => {
    let { account, token, expires } =
      await this.accountServices.queries.authenticate.handle(
        req.body.email,
        req.body.password,
        req.body.stayLoggedIn
      );
    const cookie: Cookie = {
      key: "token",
      value: token,
    };
    new SuccessResponseWithCookies(res, cookie, { token: token, account }).send(
      expires
    );
  };

  verifyEmail = async (req: Request, res: Response) => {
    await this.accountServices.commands.verifyEmail.handle(
      req.body.email,
      req.body.otp
    );
    new SuccessResponse(res, { message: "email verified" }).send();
  };

  resendVerificationOTP = async (req: Request, res: Response) => {
    await this.accountServices.commands.sendOTP.handle(req.body.email);
    new SuccessResponse(res, { message: "otp resent" }).send();
  };

  forgotPassword = async (req: Request, res: Response) => {
    await this.accountServices.commands.sendOTP.handle(
      req.body.email,
      "resetPassword"
    );
    new SuccessResponse(res, { message: "otp sent" }).send();
  };

  resetPassword = async (req: Request, res: Response) => {
    await this.accountServices.commands.resetPassword.handle(
      req.body.email,
      req.body.password,
      req.body.otp
    );
    new SuccessResponse(res, { message: "password reset" }).send();
  };
}
