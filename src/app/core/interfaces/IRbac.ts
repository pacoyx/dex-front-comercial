export interface IRole {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface ICreateRoleRequest {
    name: string;
    description: string;
}

export interface IUpdateRoleRequest {
    name: string;
    description: string;
    isActive: boolean;
}

export interface IPermission {
    id: number;
    code: string;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface IRolePermissionsResponse {
    roleId: number;
    roleName: string;
    permissions: IPermission[];
}

export interface IUpdateRolePermissionsRequest {
    permissionIds: number[];
}

export interface IUserRolesResponse {
    userId: number;
    userName: string;
    roles: IRole[];
}

export interface IUpdateUserRolesRequest {
    roleIds: number[];
}
