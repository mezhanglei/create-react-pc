import http from '@/http/request'
import Toast from '@/components/toast'

const URL = '/obtainguest/api/upload';
const NOPREFIX = true

interface UploadParams {
    file: FormData
    url: string
    noPrefix: boolean
}

let id = 0

export class Uploader {
    private type: 'image' | 'video'
    private total: number
    private dom: HTMLInputElement

    constructor(type: 'image' | 'video', setter: Function, total: number = 1) {
        let input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('id', `uploader-${++id}`)
        input.setAttribute('accept', `${type}/*`)
        if (total > 1) {
            input.multiple = true
        }

        // 产生实例的同时会向document添加一个隐藏的input:file元素
        document.body.appendChild(input)

        input.style.visibility = 'hidden'
        input.style.position = 'absolute'

        // 当这个input元素“输入”也就是选择好文件确定时，会调用内置的upload方法，我这里是调用后台的上传接口，然后把接口返回的文件信息丢给传进来的回调函数处理
        input.addEventListener('input', () => {
            this.upload().then(data => {
                setter(data)
            })
        })

        this.dom = input
        this.type = type
        this.total = total
    }

    getDom() {
        return this.dom
    }

    upload() {
        // 这里是上传的约束以及调用后台的上传接口，最后返回上传成功后的文件信息
        const input = this.dom,
            type = this.type
        return new Promise((resolve, reject) => {
            if (!input || !input.files?.length) return

            const files = input.files,
                proList = []

            if (files.length > this.total) {
                Toast.fail(`最多上传${this.total}张图片`)
                return
            }

            for (let file of [...files]) {
                if (!file.type.startsWith(type)) {
                    Toast.fail(`仅支持上传${type === 'image' ? '图片' : '视频'}类型文件`)
                    reject('file type error')
                    return
                }

                if (type === 'video' && file.size / 1024 > 1024 * 50) {
                    Toast.fail('仅支持上传50MB以内的视频文件')
                    reject('file size error')
                    return
                }

                if (type === 'image' && file.size / 1024 >= 1024 * 10) {
                    Toast.fail('仅支持上传10MB以内的图片文件')
                    reject('file size error')
                    return
                }

                const data = new FormData()
                data.append('file', file)
                // data.append('state', Base64.encode('‬10485760'))
                data.append('state', '‬10485760')

                const params: UploadParams = {
                    file: data,
                    url: URL,
                    noPrefix: NOPREFIX,
                }

                proList.push(http(params))
            }

            Promise.all(proList).then(res => {
                resolve(
                    res.map((item, idx) => ({
                        ...item.data,
                        file_name: files[idx].name,
                    }))
                )
            })
        })
    }
}