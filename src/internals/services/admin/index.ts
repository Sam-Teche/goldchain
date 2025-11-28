import {AddAdmin} from "./commands/addAdminn";
import {AdminRepository} from "../../domain/admin/repository";
import {AccountRepository} from "../../domain/account/repository";
import {OTPRepository} from "../../domain/otp/repository";
import {Environment} from "../../../package/configs/environment";
import {EmailRepository} from "../../domain/notification/repository";
import {StorageRepository} from "../../domain/storage/repository";
import {Authenticate} from "./queries/authenticate";
import {ChangePassword} from "./commands/changePassword";
import {RemoveAdmin} from "./commands/removeAdmin";
import {UpdateAdmin} from "./commands/updateAdmin";
import {GetAdmin} from "./queries/getAdmin";
import {GetAdmins} from "./queries/getAdmins";
import {ResetPassword} from "./commands/resetPassword";
import {SendOTP} from "./commands/sendOTP";
import {SetProfilePicture} from "./commands/setProfilePicture";

class Commands {
    addAdmin: AddAdmin
    changePassword: ChangePassword
    removeAdmin: RemoveAdmin
    updateAdmin: UpdateAdmin
    sendOTP: SendOTP
    resetPassword: ResetPassword
    setProfilePicture: SetProfilePicture

    constructor(adminRepository: AdminRepository, otpRepository: OTPRepository, environmentVariables: Environment, emailRepository: EmailRepository, storageRepository: StorageRepository) {
        this.addAdmin = new AddAdmin(adminRepository, emailRepository, environmentVariables)
        this.setProfilePicture = new SetProfilePicture(adminRepository, storageRepository, environmentVariables)
        this.changePassword = new ChangePassword(adminRepository)
        this.removeAdmin = new RemoveAdmin(adminRepository)
        this.updateAdmin = new UpdateAdmin(adminRepository)
        this.sendOTP = new SendOTP(adminRepository, otpRepository, environmentVariables, emailRepository)
        this.resetPassword = new ResetPassword(adminRepository, otpRepository)
    }
}

class Queries {
    authenticate: Authenticate
    getAdmin: GetAdmin
    getAdmins: GetAdmins

    constructor(adminRepository: AdminRepository, environmentVariables: Environment) {
        this.authenticate = new Authenticate(adminRepository, environmentVariables)
        this.getAdmin = new GetAdmin(adminRepository)
        this.getAdmins = new GetAdmins(adminRepository)
    }
}

class AdminServices {
    commands: Commands
    queries: Queries

    constructor(adminRepository: AdminRepository, otpRepository: OTPRepository, environmentVariables: Environment, emailRepository: EmailRepository, storageRepository: StorageRepository) {
        this.commands = new Commands(adminRepository, otpRepository, environmentVariables, emailRepository, storageRepository)
        this.queries = new Queries(adminRepository, environmentVariables)
    }
}

export default AdminServices