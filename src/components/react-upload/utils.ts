
import SparkMD5 from "spark-md5";

// 将文件分割成块
export function createFileChunk(file: File, size: number) {
    // 生成文件块
    const chunks = [];
    let cur = 0;
    while (cur < file.size) {
        chunks.push(file.slice(cur, cur + size));
        cur += size;
    }
    return chunks as File[];
}

// 抽样计算hash值
export async function calculateHashSample(file: File): Promise<string> {
    return new Promise(resolve => {
        const spark = new SparkMD5.ArrayBuffer();
        const reader = new FileReader();
        // 文件大小
        const size = file.size;
        // 大小间距2M
        let offset = 2 * 1024 * 1024;
        // 前2M大小内容
        let chunks = [file.slice(0, offset)];
        // 前面100K
        let cur = offset;
        while (cur < size) {
            // 最后一块全部加进来
            if (cur + offset >= size) {
                chunks.push(file.slice(cur, cur + offset));
            } else {
                // 中间的 前中后取两个字节
                const mid = cur + offset / 2;
                const end = cur + offset;
                chunks.push(file.slice(cur, cur + 2));
                chunks.push(file.slice(mid, mid + 2));
                chunks.push(file.slice(end - 2, end));
            }
            // 取两个字节
            cur += offset;
        }
        // 拼接
        reader.readAsArrayBuffer(new Blob(chunks));

        // 最后100K
        reader.onload = e => {
            spark.append(e?.target?.result);
            resolve(spark.end());
        };
    });
}

// 增量计算hash
export async function calculateHashSync(chunks: File[]) {
    return new Promise(resolve => {
      const spark = new SparkMD5.ArrayBuffer();
      let count = 0;

      const loadNext = (index: number) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(chunks[index]);
        reader.onload = e => {
          // 累加器 不能依赖index，
          count++;
          // 增量计算md5
          spark.append(e?.target?.result);
          if (count === chunks.length) {
            // 计算结束
            resolve(spark.end());
          } else {
            // 计算下一个
            loadNext(count);
          }
        };
      };
      // 启动
      loadNext(0);
    });
  }