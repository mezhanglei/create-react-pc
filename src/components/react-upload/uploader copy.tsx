import SparkMD5 from "spark-md5";

export interface UploadParams {
    type: 'image' | 'video'
    total: 1
}

export enum Status {
    wait = "wait",
    pause = "pause",
    uploading = "uploading",
    error = "error",
    done = "done"
};

export interface Chunk {
    fileHash: string // 文件hash值
    chunk: File // 文件块
    chunkName: string; // 文件块的name
    index: number // 序号
    progress: number // 文件块的上传进度
    size: number // 文件块的大小
}

let id = 0
const SIZE = 0.2 * 1024 * 1024;

export class Uploader {
    private type: UploadParams['type']
    private total: UploadParams['total']
    private dom: HTMLInputElement
    files: FileList | undefined;
    status: Status;
    hash: string;
    chunks?: Chunk[];

    constructor(props: UploadParams) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('id', `uploader-${++id}`);
        input.setAttribute('accept', `${props.type}/*`);
        if (props.total > 1) {
            input.multiple = true
        }

        // 产生实例的同时会向document添加一个隐藏的input:file元素
        document.body.appendChild(input)
        input.style.visibility = 'hidden'
        input.style.position = 'absolute'

        // 监听上传
        input.addEventListener('input', this.handleFileChange)

        this.dom = input
        this.type = props.type
        this.total = props.total
        this.status = Status.wait
    }

    getDom() {
        return this.dom
    }

    handleFileChange(e) {
        this.files = e.target.files;
    }

    createFileChunk(file, size = SIZE) {
        // 生成文件块
        const chunks = [];
        let cur = 0;
        while (cur < file.size) {
            chunks.push({ file: file.slice(cur, cur + size) });
            cur += size;
        }
        return chunks;
    }

    // 抽样计算hash值
    async calculateHashSample(file: File): Promise<string> {
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

    async verify(filename: string, hash: string) {
        const data = await post("/verify", { filename, hash });
        return data;
    }

    createProgresshandler(item) {
        return e => {
            item.progress = parseInt(String((e.loaded / e.total) * 100));
        };
    }

    async sendRequest(urls, max = 4, retrys = 3) {
        console.log(urls, max)

        return new Promise((resolve, reject) => {
            const len = urls.length;
            let idx = 0;
            let counter = 0;
            const retryArr = []
            const start = async () => {
                // 有请求，有通道
                while (counter < len && max > 0) {
                    max--; // 占用通道
                    console.log(idx, "start");
                    const i = urls.findIndex(v => v.status == Status.wait || v.status == Status.error)// 等待或者error
                    urls[i].status = Status.uploading
                    const form = urls[i].form;
                    const index = urls[i].index;
                    if (typeof retryArr[index] == 'number') {
                        console.log(index, '开始重试')
                    }
                    request({
                        url: '/upload',
                        data: form,
                        onProgress: this.createProgresshandler(this.chunks[index]),
                        requestList: this.requestList
                    }).then(() => {
                        urls[i].status = Status.done

                        max++; // 释放通道
                        counter++;
                        urls[counter].done = true
                        if (counter === len) {
                            resolve();
                        } else {
                            start();
                        }
                    }).catch(() => {
                        // 初始值
                        urls[i].status = Status.error
                        if (typeof retryArr[index] !== 'number') {
                            retryArr[index] = 0
                        }
                        // 次数累加
                        retryArr[index]++
                        // 一个请求报错3次的
                        if (retryArr[index] >= 2) {
                            return reject() // 考虑abort所有别的
                        }
                        console.log(index, retryArr[index], '次报错')
                        // 3次报错以内的 重启
                        this.chunks[index].progress = -1 // 报错的进度条
                        max++; // 释放当前占用的通道，但是counter不累加

                        start()
                    })
                }
            }
            start();
        });
    }

    async uploadChunks(uploadedList = []) {
        // 这里一起上传，碰见大文件就是灾难
        // 没被hash计算打到，被一次性的tcp链接把浏览器稿挂了
        // 异步并发控制策略，我记得这个也是头条一个面试题
        // 比如并发量控制成4
        const list = this.chunks
            .filter(chunk => uploadedList.indexOf(chunk.hash) == -1)
            .map(({ chunk, hash, index }, i) => {
                const form = new FormData();
                form.append("chunk", chunk);
                form.append("hash", hash);
                form.append("filename", this.container.file.name);
                form.append("fileHash", this.container.hash);
                return { form, index, status: Status.wait };
            })
        try {
            const ret = await this.sendRequest(list, 4)
            if (uploadedList.length + list.length === this.chunks.length) {
                // 上传和已经存在之和 等于全部的再合并
                await this.mergeRequest();
            }
        } catch (e) {
            // 上传有被reject的
            console.log('上传失败，请重试')
        }
    }

    async mergeRequest() {
        const [file] = this.files;
        await post("/merge", {
            filename: file.name,
            size: SIZE,
            fileHash: this.hash
        });
        // await request({
        //   url: "/merge",
        //   headers: {
        //     "content-type": "application/json"
        //   },
        //   data: JSON.stringify({
        //     filename: this.container.file.name,
        //     size:SIZE
        //   })
        // })
    }

    async handleUpload() {
        if (!this.files) return;
        this.status = Status.uploading;
        const [file] = this.files;
        const chunks = this.createFileChunk(file);
        console.log(chunks);
        this.hash = await this.calculateHashSample(file);
        if (!this.hash) return;
        // 判断文件是否存在,如果不存在，获取已经上传的切片
        const { uploaded, uploadedList } = await this.verify(file.name, this.hash);
        if (uploaded) {
            console.log('秒传，上传成功');
            return;
        }

        this.chunks = chunks.map((chunk, index) => {
            const chunkName = this.hash + "-" + index;
            return {
                fileHash: this.hash,
                chunk: chunk.file,
                index,
                chunkName: chunkName,
                progress: uploadedList.indexOf(chunkName) > -1 ? 100 : 0,
                size: chunk.file.size
            };
        });
        // 传入已经存在的切片清单
        await this.uploadChunks(uploadedList);
    }

    // 恢复上传
    async handleResume() {
        this.status = Status.uploading;
  
        const { uploadedList } = await this.verify(
          this.container.file.name,
          this.container.hash
        );
        await this.uploadChunks(uploadedList);
      }

      // 暂停上传
      handlePause() {
        this.status = Status.pause;
  
        this.requestList.forEach(xhr => xhr?.abort());
        this.requestList = [];
      }
}