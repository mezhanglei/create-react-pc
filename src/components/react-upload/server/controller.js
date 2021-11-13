const path = require('path')
const fse = require("fs-extra")
const multiparty = require("multiparty")
const { resolvePost, pipeStream,extractExt,getUploadedList,mergeFiles } = require('./util')

  


class Controller {
  constructor(uploadDir) {
    this.UPLOAD_DIR = uploadDir
  }
  async mergeFileChunk(filePath, fileHash, size){
    // cpmspe/pg)
    const chunkDir = path.resolve(this.UPLOAD_DIR, fileHash)
    let chunkPaths = await fse.readdir(chunkDir)
    // 根据切片下标进行排序
    // 否则直接读取目录的获得的顺序可能会错乱
    chunkPaths
      .sort((a, b) => a.split("-")[1] - b.split("-")[1])
    chunkPaths = chunkPaths.map(cp=>path.resolve(chunkDir, cp)) // 转成文件路径
    await mergeFiles(chunkPaths,filePath,size)
  }


  async handleVerify(req, res) {
    const data = await resolvePost(req)
    const { filename, hash } = data
    const ext = extractExt(filename)
    const filePath = path.resolve(this.UPLOAD_DIR, `${hash}${ext}`)

    // 文件是否存在
    let uploaded = false
    let uploadedList = []
    if (fse.existsSync(filePath)) {
      uploaded = true
    }else{
      // 文件没有完全上传完毕，但是可能存在部分切片上传完毕了
      uploadedList = await getUploadedList(path.resolve(this.UPLOAD_DIR, hash))
    }
    res.end(
      JSON.stringify({
        uploaded,
        uploadedList // 过滤诡异的隐藏文件
      })
    )

  }
  async handleMerge(req, res) {

    const data = await resolvePost(req)
    const {fileHash, filename, size } = data
    const ext = extractExt(filename)
    const filePath = path.resolve(this.UPLOAD_DIR, `${fileHash}${ext}`)
    await this.mergeFileChunk(filePath, fileHash, size)
    res.end(
      JSON.stringify({
        code: 0,
        message: "file merged success"
      })
    )

  
  }
  async handleUpload(req, res) {
    const multipart = new multiparty.Form()
    multipart.parse(req, async (err, field, file) => {
      if (err) {
        console.log(err)
        return
      }
      const [chunk] = file.chunk
      const [hash] = field.hash
      const [filename] = field.filename
      const [fileHash] = field.fileHash
      const filePath = path.resolve(
        this.UPLOAD_DIR,
        `${fileHash}${extractExt(filename)}`
      )
      const chunkDir = path.resolve(this.UPLOAD_DIR, fileHash)
      if(Math.random()<0.5){
        // 概率报错
        console.log('概率报错了')
        res.statusCode=500
        res.end()
        return 
      }

      // 文件存在直接返回
      if (fse.existsSync(filePath)) {
        res.end("file exist")
        return
      }

      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir)
      }
      await fse.move(chunk.path, `${chunkDir}/${hash}`)
      res.end("received file chunk")
    })
  }
}


module.exports = Controller