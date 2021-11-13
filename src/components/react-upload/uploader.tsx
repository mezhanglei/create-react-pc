import { calculateHashSample, createFileChunk } from "./utils";

export interface UploadParams {
    type?: 'image' | 'video'
    multiple?: boolean
    beforeUpload: (params: { file: File, fileHash: string }) => Promise<{ uploaded: boolean, uploadedList: string[] }>
    uploading: (params: UploadingParams) => Promise<any>
    afterUpload: (params: { file: File, size: number, fileHash: string }) => void
}

// 上传状态
export enum Status {
    wait = "wait",
    pause = "pause",
    uploading = "uploading",
    error = "error",
    done = "done"
};

// 文件块操作格式
export interface UploadChunk {
    index: number // 分割的文件块的序号，后端拿到后可以用来排序
    chunk: File // 文件块
    chunkName: string; // 文件块的name
    chunkSize: number // 文件块的大小
    progress: number // 文件块的上传进度
    fileHash: string // 文件hash值
}

// 上传文件请求的参数
export interface UploadingParams {
    chunk: UploadChunk,
    file: File,
    fileHash: string
}

// 上传文件操作的参数
export interface UploadChunksParams {
    chunks: UploadChunk[],
    uploadedList: string[],
    file: File,
    fileHash: string
}

// 异步队列类型
export interface AsyncQueues {
    callback: (...arg: any[]) => Promise<any>
    chunk: UploadChunk
    file: File
    status: Status
}

let id = 0
const SIZE = 2 * 1024 * 1024;

export class Uploader {

    private dom: HTMLInputElement
    beforeUpload: UploadParams['beforeUpload'];
    uploading: UploadParams['uploading'];
    afterUpload: UploadParams['afterUpload'];
    files: FileList | null;
    status: Status;
    hashMap: { [key: string]: string };
    chunksMap: { [key: string]: UploadChunk[] };
    cancels: any[];
    progress: number;

    constructor(props: UploadParams) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('id', `uploader-${++id}`);
        props.type && input.setAttribute('accept', `${props.type}/*`);
        if(props?.multiple) input.multiple = true;

        // 产生实例的同时会向document添加一个隐藏的input:file元素
        document.body.appendChild(input)
        input.style.visibility = 'hidden'
        input.style.position = 'absolute'

        // 监听上传
        input.addEventListener('input', this.handleFileChange.bind(this))

        this.dom = input;
        this.beforeUpload = props?.beforeUpload;
        this.uploading = props?.uploading;
        this.afterUpload = props?.afterUpload;

        this.files = null;
        this.status = Status.wait;
        this.chunksMap = {};
        this.hashMap = {};
        this.cancels = [];
        this.progress = 0;

    }

    handleFileChange(e: Event) {
        this.files = (e.target as HTMLInputElement).files;
    }

    reset() {
        this.dom.value = "";
    }

    // 上传文件
    async handleUpload() {
        if (!this.files) return;
        this.status = Status.uploading;

        for (let file of this.files) {
            // 生成hash
            const fileHash = await calculateHashSample(file);
            this.hashMap[file.name] = fileHash;
            // 判断文件是否存在,如果不存在，获取已经上传的切片
            const { uploaded, uploadedList } = await this.verify(file, fileHash);
            if (uploaded) {
                console.log('秒传，上传成功');
                this.reset();
            } else {
                // 所有的文件分块
                const chunks = this.formatChunks({ chunks: createFileChunk(file, SIZE), fileHash: fileHash, uploadedList });
                this.chunksMap[file.name] = chunks;
                await this.uploadChunks({ chunks: chunks, uploadedList, file, fileHash: fileHash });
            }
        }
    }

    // 校验
    async verify(file: File, fileHash: string) {
        const params = {
            file,
            fileHash
        }
        console.log('校验函数，返回已上传的列表');
        return this.beforeUpload(params);
    }

    // 并发执行队列，控制4个一起，错误三次的请求则终止上传（这是一个有副作用的函数）
    async concurrentExe(queues: AsyncQueues[], max = 3) {
        return new Promise((resolve, reject) => {
            const len = queues?.length;
            let count = 0;
            let errorMap: { [key: string]: number | undefined } = {};
            const start = async () => {
                // 有请求，有通道
                while (count < len && max > 0) {
                    max--;
                    const index = queues.findIndex(v => v.status == Status.wait || v.status == Status.error)
                    const execItem = queues[index];
                    const fn = execItem?.callback;
                    const chunkName = execItem?.chunk?.chunkName;
                    execItem.status = Status.uploading
                    const chunks = this.chunksMap[execItem?.file?.name];
                    const chunkIndex = chunks?.findIndex((item) => item.chunkName === chunkName)
                    fn().then((res) => {
                        max++;
                        count++;
                        // 设置状态Status.done
                        execItem.status = Status.done
                        // 进度更改
                        chunks[chunkIndex].progress = 100;
                        if (count === len) {
                            resolve(res);
                        } else {
                            start();
                        }
                    }).catch((err) => {
                        // 错误次数累计
                        const errorCount = errorMap[chunkName];
                        if (errorCount === undefined) {
                            errorMap[chunkName] = 0;
                        } else {
                            const newCount = errorCount + 1
                            errorMap[chunkName] = newCount;
                            // 一个请求报错三次就会reject
                            if (newCount >= 2) {
                                return reject(err)
                            }
                        }
                        // 设置状态Status.error
                        execItem.status = Status.error;
                        // 进度报错
                        chunks[chunkIndex].progress = -1;
                        max++;
                        start()
                    })
                }
            }
            start();
        });
    }

    // 计算当前文件进度
    fileProgress(chunks: UploadChunk[], file: File) {
        const uploadSize = chunks?.reduce((prev, next) => prev + next.chunkSize * next.progress, 0)
        const currentFileProgress = parseInt((uploadSize / file.size).toFixed(2));
        this.progress = currentFileProgress;
        return currentFileProgress;
    }

    // 上传文件
    async uploadChunks(params: UploadChunksParams) {
        const {
            chunks,
            file,
            fileHash,
            uploadedList
        } = params;

        try {
            const queues = this.createUploadQueue((param) => {
                // // xhr的配置
                // const createProgresshandler = (item: UploadChunk) => {
                //     // 执行中实时计算进度
                //     this.fileProgress(chunks, file);
                //     return (e) => item.progress = parseInt(String((e.loaded / e.total) * 100))
                // }
                // const chunks = this.chunksMap[param.file.name];
                // const index = param.chunk.index;
                // const config = {
                //     onProgress: createProgresshandler(chunks[index]), // xhr的监听api
                //     onUploadProgress: createProgresshandler(chunks[index]), // axios的监听
                //     cancelToken: new Axios.CancelToken((cancel) => this.cancels.push(cancel)),
                // }
                return this.uploading?.(param)
            }, { chunks: chunks, file, fileHash, uploadedList });
            await this.concurrentExe(queues);
            // 结束后在计算一次进度
            this.fileProgress(chunks, file);
            if (uploadedList?.length + queues?.length === chunks?.length) {
                // 上传和已经存在之和 等于全部的再合并
                await this.mergeRequest(file);
            }
        } catch (e) {
            console.log('上传失败，请重试')
            this.reset();
        }
    }

    // 合并分块请求
    async mergeRequest(file: File) {
        const params = {
            file: file,
            size: SIZE,
            fileHash: this.hashMap[file.name]
        }
        console.log('通知服务端合并分块请求')
        this.reset();
        this.afterUpload(params);
    }

    // 构建上传的队列
    createUploadQueue(fn: (params: UploadingParams) => Promise<any>, params: UploadChunksParams) {
        const {
            chunks,
            file,
            fileHash,
            uploadedList
        } = params;
        const ret: AsyncQueues[] = [];
        for (let i = 0; i < chunks?.length; i++) {
            const item = chunks[i];
            if (uploadedList?.indexOf(item.chunkName) == -1) {
                ret.push({ callback: () => fn({ chunk: item, file, fileHash }), chunk: item, file: file, status: Status.wait });
            }
        }
        return ret;
    }

    // 格式化chunks
    formatChunks = (props: { chunks: File[], fileHash: string, uploadedList: string[] }) => {
        const {
            chunks,
            fileHash,
            uploadedList
        } = props;

        const ret: UploadChunk[] = [];
        for (let i = 0; i < chunks?.length; i++) {
            const chunk = chunks[i];
            const chunkName = fileHash + "-" + i;
            const item = {
                index: i,
                chunk: chunk as File,
                chunkName: chunkName,
                chunkSize: chunk.size,
                progress: uploadedList?.indexOf(chunkName) > -1 ? 100 : 0,
                fileHash: fileHash
            };
            ret?.push(item)
        }
        return ret;
    }

    // 恢复上传
    async handleResume(file: File) {
        this.status = Status.uploading;
        const fileHash = this.hashMap[file.name];
        const chunks = this.chunksMap[file.name];
        const { uploadedList } = await this.verify(file, fileHash);
        await this.uploadChunks({ chunks: chunks, uploadedList, file, fileHash: fileHash });
    }

    // 暂停。通过axios暂停
    handlePause() {
        this.status = Status.pause;
        while (this.cancels.length > 0) {
            this.cancels.pop()();
        }
    }
}