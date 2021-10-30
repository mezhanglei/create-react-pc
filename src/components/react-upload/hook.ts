import { useEffect, useRef } from 'react'
import { Uploader } from './uploader'

interface IFile {
  file_url: string
}

interface UploadParams {
  callback(file: Array<IFile>): void
  type?: 'image' | 'video'
  count?: number
}

export default function useUpload({ callback, type = 'image', count }: UploadParams) {
  const uploader = useRef<HTMLInputElement>()

  useEffect(() => {
    let { dom } = new Uploader(
      type,
      (file: Array<IFile>) => {
        callback(file)
      },
      count
    )
    // 暴露出input元素
    uploader.current = dom
    return () => {
      document.body.removeChild(dom)
    }
  }, [callback, type, count])

  return uploader
}