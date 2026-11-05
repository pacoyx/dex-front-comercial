export interface IDriverLocation {
    employeeId: number;
    employeeName: string;
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
    recordedAt: string;
}

export interface IDriverLookup {
    employeeId: number;
    employeeName: string;
}

export interface IDriverRoutePoint {
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
    recordedAt: string;
}

export interface IDriverRouteResponse {
    employeeId: number;
    employeeName: string;
    points: IDriverRoutePoint[];
}
