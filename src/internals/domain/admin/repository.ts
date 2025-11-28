import {IAdmin, AdminFilter, Admin} from "./admin";

export interface AdminRepository {
    CreateAdmin: (email: string, password: string, fullName: string) => Promise<string>
    UpdateAdmin: (accountId: string, account: Partial<IAdmin>) => Promise<void>
    DeleteAdmin: (accountId: string) => Promise<void>
    GetAdmins: (filter: AdminFilter) => Promise<Admin[]>
    GetAdmin: (accountId?: string, email?: string) => Promise<Admin>
}