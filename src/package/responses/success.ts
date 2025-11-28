import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Environment } from "../configs/environment";
import Cookie from "../types/cookies";

export class SuccessResponse {
  success: Success;
  response: Response;

  constructor(res: Response, data?: any, metadata?: any) {
    this.response = res;
    this.success = {
      statusCode: StatusCodes.OK,
      message: "success",
    };

    if (data !== null && data !== undefined) {
      this.success.data = data;
    }

    if (metadata !== null && metadata !== undefined) {
      this.success.metadata = metadata;
    }
  }

  send = () => {
    this.response.status(this.success.statusCode).json(this.success);
  };
}

export class SuccessResponseWithHTML {
  html: string;
  response: Response;

  constructor(res: Response, html: string) {
    this.response = res;
    this.html = html;
  }

  send = () => {
    this.response.status(StatusCodes.OK).send(this.html);
  };
}

export class SuccessResponseWithCookies {
  success: Success;
  response: Response;
  cookie: Cookie;

  constructor(res: Response, cookie: Cookie, data?: any, metadata?: any) {
    this.response = res;
    this.cookie = cookie;
    this.success = {
      statusCode: StatusCodes.OK,
      message: "success",
    };
    if (data !== null && data !== undefined) {
      this.success.data = data;
    }

    if (metadata !== null && metadata !== undefined) {
      this.success.metadata = metadata;
    }
  }

  send = (expires?: number) => {
    const environmentVariables = new Environment();
    this.response
      .cookie(this.cookie.key, this.cookie.value, {
        signed: true,
        maxAge: expires || environmentVariables.cookieExpires,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(this.success.statusCode)
      .json(this.success);
  };
}

type Success = {
  statusCode: number;
  message: string;
  data?: any;
  metadata?: any;
};
