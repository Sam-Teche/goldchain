import {AccountRepository} from "../../domain/account/repository";
import {CreateAccount} from "./commands/createAccount";
import {Environment} from "../../../package/configs/environment";
import {EmailRepository} from "../../domain/notification/repository";
import {Authenticate} from "./queries/authenticate";
import {VerifyEmail} from "./commands/verifyEmail";
import {GetAccount} from "./queries/getAccount";
import {DeleteAccount} from "./commands/deleteAccount";
import {ChangePassword} from "./commands/changePassword";
import {ForgotPassword} from "./queries/forgotPassword";
import {SendOTP} from "./commands/sendOTP";
import {SetupAccount} from "./commands/setupAccount";
import {StorageRepository} from "../../domain/storage/repository";
import {OTPRepository} from "../../domain/otp/repository";
import {GetAccounts} from "./queries/getAccounts";
import {AddNote} from "../note/command/addNote";
import {ChangeAccountStatus} from "./commands/changeAccountStatus";
import {PayActivationFee} from "./commands/payActivationFee";
import {PaymentRepository} from "../../domain/payment/repository";
import {ActivateAccount} from "./commands/activateAccount";
import {ResetPassword} from "./commands/resetPassword";
import {Analytics} from "./queries/analytics";
import {LedgerRepository} from "../../domain/ledger/repository";
import {ListingRepository} from "../../domain/listing/repository";
import { UpdateAccount } from "./commands/updateAccount";

class Commands {
    createAccount: CreateAccount
    verifyEmail: VerifyEmail
    sendOTP: SendOTP
    resetPassword: ResetPassword
    setupAccount: SetupAccount
    deleteAccount: DeleteAccount
    changePassword: ChangePassword
    changeAccountStatus: ChangeAccountStatus
    payActivationFee: PayActivationFee
    activateAccount: ActivateAccount
    updateAccount: UpdateAccount

    constructor(accountRepository: AccountRepository, otpRepository: OTPRepository, environmentVariables: Environment, emailRepository: EmailRepository, storageRepository: StorageRepository, paymentRepository: PaymentRepository) {
        this.createAccount = new CreateAccount(accountRepository, otpRepository, environmentVariables, emailRepository)
        this.verifyEmail = new VerifyEmail(accountRepository, otpRepository)
        this.sendOTP = new SendOTP(accountRepository, otpRepository, environmentVariables, emailRepository)
        this.resetPassword = new ResetPassword(accountRepository, otpRepository)
        this.setupAccount = new SetupAccount(accountRepository, environmentVariables, storageRepository)
        this.deleteAccount = new DeleteAccount(accountRepository)
        this.changePassword = new ChangePassword(accountRepository)
        this.changeAccountStatus = new ChangeAccountStatus(accountRepository, emailRepository, environmentVariables)
        this.payActivationFee = new PayActivationFee(accountRepository, paymentRepository, environmentVariables)
        this.activateAccount = new ActivateAccount(accountRepository, environmentVariables, emailRepository)
        this.updateAccount = new UpdateAccount(accountRepository)
    }
}

class Queries {
    authenticate: Authenticate
    getAccount: GetAccount
    getAccounts: GetAccounts
    forgotPassword: ForgotPassword
    analytics: Analytics

    constructor(accountRepository: AccountRepository, environmentVariables: Environment, emailRepository: EmailRepository, ledgerRepository: LedgerRepository, listingRepository: ListingRepository,) {
        this.authenticate = new Authenticate(accountRepository, environmentVariables)
        this.getAccount = new GetAccount(accountRepository)
        this.getAccounts = new GetAccounts(accountRepository)
        this.forgotPassword = new ForgotPassword(accountRepository, environmentVariables, emailRepository)
        this.analytics = new Analytics(ledgerRepository, listingRepository, accountRepository)
    }
}

class AccountServices {
    commands: Commands
    queries: Queries

    constructor(accountRepository: AccountRepository, otpRepository: OTPRepository, environmentVariables: Environment, emailRepository: EmailRepository, storageRepository: StorageRepository, paymentRepository: PaymentRepository, ledgerRepository: LedgerRepository, listingRepository: ListingRepository,) {
        this.commands = new Commands(accountRepository, otpRepository, environmentVariables, emailRepository, storageRepository, paymentRepository)
        this.queries = new Queries(accountRepository, environmentVariables, emailRepository, ledgerRepository, listingRepository)
    }
}

export default AccountServices