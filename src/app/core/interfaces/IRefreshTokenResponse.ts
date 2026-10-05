export interface IRefreshTokenResponse {
    token: string;
    refreshToken: string;
    roles: string[];
    permissions: string[];
}
