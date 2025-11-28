import {Account} from "../../internals/domain/account/account";
import {Admin} from "../../internals/domain/admin/admin";
import 'multer'

declare global {
    namespace Express {
        export interface Request {
            account: Account,
            admin: Admin,
            signedCookies?: any;
        }
    }
}
