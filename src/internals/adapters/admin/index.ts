import {AdminRepository} from "../../domain/admin/repository";
import {IAdmin, AdminFilter, Admin} from "../../domain/admin/admin";
import {AdminModel} from "./schema";
import {BadRequestError} from "../../../package/errors/customError";

export default class AdminClass implements AdminRepository {
    async CreateAdmin(email: string, password: string, fullName: string): Promise<string> {
        try {
            let admin = await AdminModel.create({email, password, fullName})
            return admin.id
        } catch (error: any) {
            if (error.code === 11000) {
                throw new BadRequestError("email already in use");
            }
            throw error
        }
    }

    async DeleteAdmin(adminId: string): Promise<void> {
        await AdminModel.deleteOne({_id: adminId})
    }

    async GetAdmins(filter: AdminFilter): Promise<Admin[]> {
        const query: any = {};
        if (filter.id) query._id = filter.id;
        if (filter.email) query.email = filter.email.toLowerCase();
        if (filter.status) query.status = Array.isArray(filter.status) ? {$in: filter.status} : filter.status;
        if (filter.createdAtFrom) query.createdAt = {$gte: filter.createdAtFrom};
        if (filter.createdAtTo) query.createdAt = {$lte: filter.createdAtTo, ...query.createdAt};


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

        // Pagination
        const limit = typeof filter.limit === 'number' ? filter.limit : 20;
        const page = typeof filter.page === 'number' ? filter.page : 1;
        const skip = (page - 1) * limit;

        return await AdminModel.find(query)
            .skip(skip)
            .sort("-updatedAt")
            .limit(limit)
            .lean<Admin[]>()
    }

    async GetAdmin(adminId?: string, email?: string): Promise<Admin> {
        try {
            let query: any = {};
            if (adminId) query._id = adminId;
            if (email) query.email = email.toLowerCase();
            const admin = await AdminModel.findOne(query).lean<Admin>().exec();
            if (!admin) throw new BadRequestError("admin does not exist")
            return admin;
        } catch (error) {
            throw error
        }
    }

    async UpdateAdmin(adminId: string, admin: Partial<IAdmin>): Promise<void> {
        admin.updatedAt = new Date();
        await AdminModel.updateOne({_id: adminId}, {$set: admin}).exec();
    }

    private parseDateRange(value: any) {
        if (!value) return undefined;
        if (typeof value === 'object' && value.start && value.end) {
            return {$gte: new Date(value.start), $lte: new Date(value.end)};
        } else if (typeof value === 'string' || value instanceof Date) {
            return new Date(value);
        }
        return undefined;
    }
}
