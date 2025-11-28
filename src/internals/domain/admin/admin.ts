import {
    IAccount,
} from "../account/account";

export type AdminRoles = "viewer" | "sales" | "hr" | "super";
export type AdminStatus = "pending" | "approved" | "rejected" | "banned";


export interface IAdmin {
    email: string;
    password: string;
    fullName: string;
    profilePicture?: string;
    status: AdminStatus;
    roles: AdminRoles[];
    isAdmin: true
    createdAt: Date;
    updatedAt: Date;
}

export type Admin = IAdmin & { _id: string }

export type AdminFilter = {
    id?: string;
    email?: string;
    status?: IAccount['status'] | Array<IAccount['status']>;
    createdAtFrom?: Date | string;
    createdAtTo?: Date | string;
    searchTerm?: string;
    limit?: number,
    page?: number
};
