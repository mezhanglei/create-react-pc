import { isEmpty } from "./type";

// 针对目标字符串，返回匹配的值
export const matchChar = (content: string, keyWords?: string) => {
    if (!content) return;
    if (isEmpty(keyWords)) return content;
    // 是否有空格分词
    const splitParts: string[] = keyWords?.split(' ') || [];
    // 正则匹配字符串
    let matchRegStr = '';
    for (let i = 0; i < splitParts?.length; i++) {
        matchRegStr += '(' + splitParts[i] + ')([\\s\\S]*)';
    }
    const matchReg = new RegExp(matchRegStr);
    const matchRes = content?.match(matchReg);
    let k = 0;
    if (matchRes !== null) {
        let replaceReturn = "";
        for (let j = 1; j < matchRes.length; j++) {
            if (matchRes[j] === splitParts[k]) {
                replaceReturn += '<span style="color:red;">$' + j + '</span>';
                k++;
            } else {
                // 与 regexp 中的第1到第99个子表达式相匹配的文本。
                replaceReturn += '$' + j;
            }
        }
        return content?.replace(matchReg, replaceReturn)
    }
}
