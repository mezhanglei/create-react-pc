// 响应体类型
export interface ServiceRes<T = any> {
    data: T;
    srvTime: number;
    status: number;
    success: boolean;
}

export type RequestResponse<S> = Promise<ServiceRes<S>>;