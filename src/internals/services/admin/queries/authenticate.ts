import {AdminRepository} from "../../../domain/admin/repository";
import {UnAuthorizedError} from "../../../../package/errors/customError";
import {compareHash, signToken} from "../../../../package/utils/encryption";
import Payload from "../../../../package/types/payload";
import {Admin} from "../../../domain/admin/admin";
import {Account} from "../../../domain/account/account";
import {AccountRepository} from "../../../domain/account/repository";
import {Environment} from "../../../../package/configs/environment";

export class Authenticate {
    repository: AdminRepository;
    environmentVariables: Environment

    constructor(
        repository: AdminRepository,
        environmentVariables: Environment
    ) {
        this.repository = repository;
        this.environmentVariables = environmentVariables;
    }

    handle = async (email: string, password: string, stayLoggedIn?: boolean): Promise<{
        admin: Admin,
        token: string,
        expires?: number
    }> => {
        try {
            let admin = await this.repository.GetAdmin("", email);
            const passwordCorrect = compareHash(password, admin.password);
            if (!passwordCorrect) {
                throw new UnAuthorizedError(`invalid email or password`);
            }

            const payload: Payload = {_id: admin._id, isAdmin: true};
            const token = signToken(payload, stayLoggedIn ? this.environmentVariables.jwtExpiresStay : undefined)

            admin.password = "";
            return {
                admin,
                token,
                expires: stayLoggedIn ? this.environmentVariables.cookieExpiresStay : undefined
            }
        } catch (error) {
            throw error;
        }
    };
}