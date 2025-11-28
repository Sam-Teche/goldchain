import {NextFunction, Request, Response} from "express";
import {UnAuthorizedError} from "../errors/customError";

export type Permission =
    | "read_account"
    | "edit_account"
    | "delete_account"

    | "add_admin"
    | "read_admin"
    | "edit_admin"
    | "delete_admin"

    | "read_order"
    | "edit_order"
    | "delete_order"

    | "read_listing"
    | "edit_listing"
    | "delete_listing"

export type AdminRole = {
    name: string;
    permissions: Permission[];
};

export const AdminRoles: AdminRole[] = [
    {
        name: "super",
        permissions: [
            "read_account",
            "edit_account",
            "delete_account",
            "add_admin",
            "read_admin",
            "edit_admin",
            "delete_admin",
            "read_order",
            "edit_order",
            "delete_order",
            "read_listing",
            "edit_listing",
            "delete_listing",
        ],
    },
    {
        name: "hr",
        permissions: [
            "read_account",
            "edit_account",
            "delete_account",
            "add_admin",
            "read_admin",
            "edit_admin",
            "delete_admin",
        ],
    },
    {
        name: "sales",
        permissions: ["read_order", "edit_order", "delete_order"],
    },
    {
        name: "viewer",
        permissions: ["read_account", "read_admin", "read_order", "read_listing"],
    },
];

export class Roles {
    static roles: AdminRole[] = AdminRoles;

    static getRoleByName(name: string): AdminRole | undefined {
        return this.roles.find((role) => role.name === name);
    }
}

const CheckPermission = (permission: Permission) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.admin) {
            const admin = req.admin;
            if (admin.status != "approved") {
                throw new UnAuthorizedError("access denied");
            }
            const adminRoles =
                admin.roles.length < 1 ? ["viewer"] : admin.roles;

            const adminPermissions = adminRoles
                .map((role: string) => {
                    return Roles.getRoleByName(role)?.permissions;
                })
                .flat()
                .filter((perm): perm is Permission => perm !== undefined);
            if (adminPermissions.includes(permission)) {
                next();
            } else {
                throw new UnAuthorizedError("access denied");
            }
        } else {
            throw new UnAuthorizedError("access denied");
        }
    };
};

export default CheckPermission;