const fse = require("fs-extra")
const path = require('path')

exports.resolvePost = req =>
  new Promise(resolve => {
    let chunk = ""
    req.on("data", data => {
      chunk += data
    })
    req.on("end", () => {
      resolve(JSON.parse(chunk))
    })
  })

const pipeStream = (filePath, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(filePath)
    readStream.on("end", () => {
      // 删除文件
      fse.unlinkSync(filePath)
      resolve()
    })
    readStream.pipe(writeStream)
  })
exports.mergeFiles = async (files,dest,size)=>{
  await Promise.all(
    files.map((file, index) =>
      pipeStream(
        file,
        // 指定位置创建可写流 加一个put避免文件夹和文件重名
        // hash后不存在这个问题，因为文件夹没有后缀
        // fse.createWriteStream(path.resolve(dest, '../', 'out' + filename), {
        fse.createWriteStream(dest, {
          start: index * size,
          end: (index + 1) * size
        })
      )
    )
  )

}


  // 返回已经上传切片名列表

exports.getUploadedList = async (dirPath)=>{
    return fse.existsSync(dirPath) 
      ? (await fse.readdir(dirPath)).filter(name=>name[0]!=='.') // 过滤诡异的隐藏文件
      : []
  }
exports.extractExt = filename => filename.slice(filename.lastIndexOf("."), filename.length)



const sleep = ms => new Promise(resolve => setTimeout(resolve, ms*1000))


function sendRequest(urls, max, callback) {
  const len = urls.length;
  let idx = 0;
  let counter = 0;

  async function start() {
    // 有请求，有通道
    while (idx < len && max > 0) {
      max--; // 占用通道
      console.log(urls[idx],'start')
      sleep(urls[idx++]).then(()=>{
        max++; // 释放通道
        counter++;
        if (counter === len) {
          return callback();
        } else {
          start();
        }

      })

    }
  }
  start();
}
// setInterval(()=>{
//   console.log('x')
// },1000)

// sendRequest([1,4,6,1.5,5,2.5,3.5],3, function() {
//   console.log('done');
// });
// 1s
// 4s
// 2s
// 1end
// 3s
// 2emd
// 5s






