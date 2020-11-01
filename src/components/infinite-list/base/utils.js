
export function getDocumentValue(key) {
    const doc = document.documentElement;
    const body = document.body;
    if (doc[key]) {
        return doc[key];
    }
    return body[key];
}