import { Request, Response, Router } from "express";
import AccountServices from "../../../../services/accounts";
import { AuthorizeAdmin } from "../../../../../package/middleware/authorization";
import ValidationMiddleware from "../../../../../package/middleware/validation";
import { SuccessResponse } from "../../../../../package/responses/success";
import CheckPermission from "../../../../../package/middleware/permission";
import AdminServices from "../../../../services/admin";
import {
  AccountFilterSchema,
  NoteFilterSchema,
  NoteSchema,
  MongoIdSchema,
  AccountStatusSchema,
  UpdateAccountDetailsSchema,

} from "./validationSchema";
import { AccountFilter } from "../../../../domain/account/account";
import NoteServices from "../../../../services/note";
import Filter from "../../../../../package/types/filter";

export default class Handler {
  router: Router;
  accountServices: AccountServices;
  adminServices: AdminServices;
  noteServices: NoteServices;

  constructor(
    accountServices: AccountServices,
    adminServices: AdminServices,
    noteServices: NoteServices
  ) {
    this.accountServices = accountServices;
    this.adminServices = adminServices;
    this.noteServices = noteServices;

    this.router = Router();

    this.configureRoutes();
  }

  private configureRoutes() {
    this.router
      .route("/")
      .get(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("read_account"),
        ValidationMiddleware(AccountFilterSchema, "query"),
        this.getAccounts
      );

    this.router
      .route("/note/:accountId")
      .post(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("read_account"),
        ValidationMiddleware(MongoIdSchema, "params"),
        ValidationMiddleware(NoteSchema, "body"),
        this.addNote
      )
      .get(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("read_account"),
        ValidationMiddleware(MongoIdSchema, "params"),
        ValidationMiddleware(NoteFilterSchema, "query"),
        this.getNotes
      );

    this.router
      .route("/:accountId/details")
      .put(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("edit_account"),
        ValidationMiddleware(MongoIdSchema, "params"),
        ValidationMiddleware(UpdateAccountDetailsSchema, "body"),
        this.updateAccount
      );

    this.router
      .route("/:accountId")
      .patch(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("edit_account"),
        ValidationMiddleware(MongoIdSchema, "params"),
        ValidationMiddleware(AccountStatusSchema, "body"),
        this.changeAccountStatus
      )
      .get(
        AuthorizeAdmin(this.adminServices),
        CheckPermission("read_account"),
        ValidationMiddleware(MongoIdSchema, "params"),
        this.getAccount
      );
  }

  getAccounts = async (req: Request, res: Response) => {
    let filter = req.query as unknown as AccountFilter;
    //filter.activated = true;
    const accounts =
      await this.accountServices.queries.getAccounts.handle(filter);
    new SuccessResponse(res, { accounts }).send();
  };

  getAccount = async (req: Request, res: Response) => {
    const account = await this.accountServices.queries.getAccount.handle(
      req.params.accountId
    );
    new SuccessResponse(res, { account }).send();
  };

  changeAccountStatus = async (req: Request, res: Response) => {
    await this.accountServices.commands.changeAccountStatus.handle(
      req.params.accountId,
      req.body.status
    );
    new SuccessResponse(res).send();
  };

  addNote = async (req: Request, res: Response) => {
    await this.noteServices.commands.addNote.handle(
      req.params.accountId,
      req.admin._id,
      req.body.note
    );
    new SuccessResponse(res).send();
  };

  getNotes = async (req: Request, res: Response) => {
    let filter = req.query as unknown as Filter;
    const notes = await this.noteServices.queries.getNotes.handle(
      req.params.accountId,
      "Account",
      filter
    );
    new SuccessResponse(res, { notes }).send();
  };

  updateAccount = async (req: Request, res: Response) => {
    await this.accountServices.commands.updateAccount.handle(
      req.params.accountId,
      req.body
    );
    new SuccessResponse(res, {
      message: "Account details updated successfully",
    }).send();
  };
}
