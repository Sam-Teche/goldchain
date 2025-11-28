import {AccountRepository} from "../../domain/account/repository";
import {IAccount, AccountFilter, Account} from "../../domain/account/account";
import {AccountModel} from "./schema";
import {BadRequestError, NotFoundError} from "../../../package/errors/customError";

export default class AccountClass implements AccountRepository {
    async CreateAccount(email: string, password: string): Promise<string> {
        try {
            let account = await AccountModel.create({email, password})
            return account.id
        } catch (error: any) {
            if (error.code === 11000) {
                throw new BadRequestError("email already in use");
            }
            throw error
        }
    }

    async DeleteAccount(accountId: string): Promise<void> {
        const result = await AccountModel.deleteOne({_id: accountId});
        if (result.deletedCount === 0) {
            throw new NotFoundError("listing does not exist");
        }
    }

    async GetAccounts(filter: AccountFilter): Promise<Account[]> {
        const query: any = {};
        if (filter.email) query.email = filter.email.toLowerCase();
        if (filter.status) query.status = Array.isArray(filter.status) ? {$in: filter.status} : filter.status;
        if (filter.type) query.type = Array.isArray(filter.type) ? {$in: filter.type} : filter.type;
        if (typeof filter.emailVerified === 'boolean') query.emailVerified = filter.emailVerified;
        if (typeof filter.activated === 'boolean') query.activated = filter.activated;
        if (filter.activationReference) query.activationReference = filter.activationReference;
        if (filter.startDate) query.createdAt = {$gte: filter.startDate};
        if (filter.endDate) query.createdAt = {$lte: filter.endDate, ...query.createdAt};

        // Text search across several fields (case-insensitive)
        if (filter.searchTerm) {
            const regex = new RegExp(filter.searchTerm, 'i');
            query.$or = [
                {email: regex},
                {'profile.fullName': regex},
                {'profile.companyName': regex},
                {'profile.city': regex},
                {'profile.state': regex},
                {'profile.country': regex}
            ];
        }


        const limit = Number(filter.limit) || 20;
        const page = Number(filter.page) || 1;
        const skip = (page - 1) * limit;

        return await AccountModel.find(query)
            .select('-password')
            .sort("-updatedAt")
            .skip(skip)
            .limit(limit)
            .lean<Account[]>()
            .exec();
    }

    async GetAccount(accountId?: string, email?: string): Promise<Account> {
        try {
            let query: any = {};
            if (accountId) query._id = accountId;
            if (email) query.email = email.toLowerCase();
            const account = await AccountModel.findOne(query).lean<Account>().exec();
            if (!account) throw new NotFoundError("account does not exist")
            return account;
        } catch (error) {
            throw error
        }
    }

    async UpdateAccount(accountId: string, account: Partial<IAccount>): Promise<void> {
        await AccountModel.updateOne({_id: accountId}, {$set: account}).exec();
    }

    private parseDateRange(value: any) {
        if (!value) return undefined;
        console.log({value})
        if (typeof value === 'object' && value.from && value.to) {
            return {$gte: new Date(value.start), $lte: new Date(value.end)};
        } else if (typeof value === 'string' || value instanceof Date) {
            return new Date(value);
        }
        return undefined;
    }
}