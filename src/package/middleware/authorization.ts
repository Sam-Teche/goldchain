import { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  ForbidenError,
  UnAuthorizedError,
} from "../errors/customError";
import { verifyToken } from "../utils/encryption";
import Payload from "../types/payload";
import AccountServices from "../../internals/services/accounts";
import AdminServices from "../../internals/services/admin";
import { IncomingMessage } from "http";
import ChatServices from "../../internals/services/chat";
import url from "url";
import { z } from "zod";

export const Authorize = (services: AccountServices) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let { token } = req.signedCookies;
    if (!token) {
      token = req.headers.authorization?.split(" ")[1];
    }
    if (!token) {
      token = req.query.token;
    }
    if (!token) throw new ForbidenError("session has expired");

    const jwtPayload = verifyToken(token);
    const payload: Payload = jwtPayload as Payload;

    req.account = await services.queries.getAccount.handle(payload._id);
    // if (req.account.status != "approved") throw new UnAuthorizedError("account not yet approved")
    next();
  };
};

export const AuthorizeAdmin = (services: AdminServices) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let { adminToken: token } = req.signedCookies;
    if (!token) {
      token = req.headers.authorization?.split(" ")[1];
    }
    if (!token) {
      token = req.query.token;
    }
    if (!token) throw new ForbidenError("session has expired");

    const jwtPayload = verifyToken(token);
    const payload: Payload = jwtPayload as Payload;

    req.admin = await services.queries.getAdmin.handle(payload._id);
    // if (req.admin.status != "approved") throw new UnAuthorizedError("admin not yet approved")
    next();
  };
};

export const conversationSchema = z.object({
  conversationId: z.string().regex(/^[a-fA-F0-9]{24}$/, {
    message: "invalid listing id",
  }),
});

export const ConversationAccess = async (
  req: IncomingMessage,
  service: ChatServices
): Promise<string> => {
  let url = req.url;
  if (!url) throw new BadRequestError("invalid url");

  const urlParts = url.split("/").filter((segment) => segment !== ""); // Remove empty segments

  let token = req.headers["authorization"]?.split(" ")[1];
  let conversationId;

  if (token) {
    conversationId = urlParts[urlParts.length - 1];
  } else {
    token = urlParts[urlParts.length - 1];
    conversationId = urlParts[urlParts.length - 2];
  }

  if (!token) throw new UnAuthorizedError("provide authentication token");
  if (!conversationId) throw new BadRequestError("conversation ID not found");

  const payload = verifyToken(token) as Payload;
  if (!conversationId) throw new BadRequestError("invalid path");
  const parsed = conversationSchema.safeParse({ conversationId });
  if (!parsed.success) {
    throw new BadRequestError(`Invalid conversation id: ${conversationId}`);
  }

  const authorized = await service.queries.authorized.handle(
    conversationId,
    payload._id,
    payload.isAdmin
  );
  if (!authorized) throw new ForbidenError("no access to conversation");
  return conversationId;
};
