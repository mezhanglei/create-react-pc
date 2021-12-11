// 获取嵌套对象中的所有的目标字段值
export const deepGetKeys = (function () {
    let path;
    let finding: { path: string, value: any }[] = [];
    const findKey = (data: object, field: string, pathKey?: string) => {
        for (const key in data) {
            path = pathKey ? `${pathKey}.${key}` : key;
            if (key === field) {
                const target = data[key];
                if (target && pathKey) {
                    finding.push({ path: pathKey, value: target });
                }
            }
            if (typeof (data[key]) === 'object') {
                finding = findKey(data[key], field, path);
            }
        }
        return finding;
    };
    return findKey;
})();
