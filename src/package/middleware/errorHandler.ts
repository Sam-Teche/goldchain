import {ErrorRequestHandler, NextFunction, Request, Response} from "express";
import {BadRequestError, CustomError} from "../errors/customError";
import {ErrorResponse} from "../responses/error";
import {ZodError} from "zod";
import {StatusCodes} from "http-status-codes";
import {JsonWebTokenError} from "jsonwebtoken";

const ErrorHandlerMiddleware: ErrorRequestHandler = async (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(err);
    if (err instanceof CustomError) {
        return new ErrorResponse(res, err.message, err.statusCode).send();
    }

    if (err instanceof ZodError) {
        const errorMessages = err.errors.map((issue: any) => ({
            message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        return new ErrorResponse(res, "Invalid data", StatusCodes.BAD_REQUEST, {
            details: errorMessages,
        }).send();
    }

    if (err instanceof JsonWebTokenError) {
        // Customize the message based on the specific error type
        if (err.name === 'TokenExpiredError') {
            return new ErrorResponse(res, "Token has expired", StatusCodes.BAD_REQUEST).send();
        }
        return new ErrorResponse(res, "Invalid token", StatusCodes.BAD_REQUEST).send();

    }

    return new ErrorResponse(res).send();
};

export default ErrorHandlerMiddleware;