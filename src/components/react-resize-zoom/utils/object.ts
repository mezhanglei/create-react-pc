// 过滤对象
export function filterObject(obj: object | undefined | null, callback: (value: any, key?: string) => boolean): any {
    if(obj === undefined || obj === null) return obj;
    const entries = Object.entries(obj)?.filter((item) => (callback(item[1], item[0])));
    return Object.fromEntries(entries);
}