export interface UploadingParams extends QueueParams {
    progress: number
    chunks: UploadChunk[]
}

export interface UploadParams {
    type?: 'image' | 'video'
    chunkSize?: number
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

// 请求操作的参数
export interface QueueParams {
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