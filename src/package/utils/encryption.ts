import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import {Environment} from "../configs/environment";
import {UnAuthorizedError} from "../errors/customError";

export const encrypt = async (password: string): Promise<string> => {
    var salt = bcrypt.genSaltSync(10);
    return await bcrypt.hash(password, salt);
};

export const compareHash = (
    password: string,
    hash: string | undefined
): boolean => {
    if (hash == undefined) {
        return false;
    } else {
        return bcrypt.compareSync(password, hash);
    }
};

export const signToken = (payload: string | object, expiryTime?: number): string => {
    const environmentVariables = new Environment();
    const options: jwt.SignOptions = {
        expiresIn: expiryTime ? expiryTime : environmentVariables.jwtExpires
    };
    return jwt.sign(payload, environmentVariables.jwtSecret, options);
};

export const verifyToken = (token: string) => {
    const environmentVariables = new Environment();
    try {
        return jwt.verify(token, environmentVariables.jwtSecret);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnAuthorizedError("session has expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new UnAuthorizedError("invalid token");
        } else {
            throw error;
        }
    }
};