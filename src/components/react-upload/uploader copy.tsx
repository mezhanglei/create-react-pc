interface UploadParams {
    type: 'image' | 'video'
    total: 1
}

let id = 0

export class Uploader {
    private type: UploadParams['type']
    private total: UploadParams['total']
    private dom: HTMLInputElement
    files: FileList | undefined;

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
    }

    getDom() {
        return this.dom
    }

    handleFileChange(e) {
        this.files = e.target.files;
    }
}