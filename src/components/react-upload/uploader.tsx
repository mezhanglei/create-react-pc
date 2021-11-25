import { UploadParams, Status, UploadChunk, AsyncQueues, QueueParams, UploadChunksParams } from "./types";
import { calculateHashSample, createFileChunk } from "./utils";
import CreateWorker from 'worker-loader!./md5-worker.js';

let id = 0

export class Uploader {

    public dom: HTMLInputElement
    beforeUpload: UploadParams['beforeUpload'];
    uploading: UploadParams['uploading'];
    afterUpload: UploadParams['afterUpload'];
    onError: UploadParams['onError'];
    chunkSize: number;
    files: FileList | null;
    status: Status;
    hashMap: { [key: string]: string };
    chunksMap: { [key: string]: UploadChunk[] };
    progress: number;

    constructor(props: UploadParams) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('id', `uploader-${++id}`);
        props.type && input.setAttribute('accept', `${props.type}/*`);
        if (props?.multiple) input.multiple = true;

        // 产生实例的同时会向document添加一个隐藏的input:file元素
        document.body.appendChild(input)
        input.style.visibility = 'hidden'
        input.style.position = 'absolute'

        // 监听上传
        input.addEventListener('input', this.handleFileChange.bind(this))

        this.dom = input;
        this.chunkSize = 2 * 1024 * 1024;
        this.beforeUpload = props?.beforeUpload;
        this.uploading = props?.uploading;
        this.afterUpload = props?.afterUpload;
        this.onError = props?.onError;

        this.files = null;
        this.status = Status.wait;
        this.chunksMap = {};
        this.hashMap = {};
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
        // 计算hash的wroker子线程
        // const worker = new CreateWorker();
        for (let file of this.files) {
            // 生成hash
            const fileHash = await calculateHashSample(file);
            // 利用worker计算hash
            // worker.postMessage(file);
            // worker.onmessage = async (event) => {
            // 子线程中计算的md5
            //   const fileHash = event.data;
            // };
            this.hashMap[file.name] = fileHash;
            // 判断文件是否存在,如果不存在，获取已经上传的切片
            const { uploaded, uploadedList } = await this.verify(file, fileHash);
            if (uploaded) {
                console.log('秒传，上传成功');
                this.reset();
            } else {
                // 所有的文件分块
                const chunks = this.formatChunks({ chunks: createFileChunk(file, this.chunkSize), fileHash: fileHash, uploadedList });
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
                                this.onError?.(execItem)
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
            const queues = this.createUploadQueue((filAndChunk) => {
                const progress = this.fileProgress(chunks, file);
                return this.uploading?.({ ...filAndChunk, progress, chunks })
            }, { chunks: chunks, file, fileHash, uploadedList });
            await this.concurrentExe(queues);
            // 结束后在计算一次进度
            this.fileProgress(chunks, file);
            if (uploadedList?.length + queues?.length === chunks?.length) {
                // 上传和已经存在之和 等于全部的再合并
                await this.mergeRequest(file);
            }
        } catch (e) {
            console.log('上传失败，请重试', e)
            this.reset();
        }
    }

    // 合并分块请求
    async mergeRequest(file: File) {
        const params = {
            file: file,
            size: this.chunkSize,
            fileHash: this.hashMap[file.name]
        }
        console.log('通知服务端合并分块请求')
        this.reset();
        this.afterUpload(params);
    }

    // 构建上传的队列
    createUploadQueue(fn: (filAndChunk: QueueParams) => Promise<any>, params: UploadChunksParams) {
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

    // 继续上传
    async handleResume(file: File) {
        this.status = Status.uploading;
        const fileHash = this.hashMap[file.name];
        const chunks = this.chunksMap[file.name];
        const { uploadedList } = await this.verify(file, fileHash);
        await this.uploadChunks({ chunks: chunks, uploadedList, file, fileHash: fileHash });
    }
}