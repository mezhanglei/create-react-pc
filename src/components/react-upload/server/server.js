const http = require("http")
const path = require('path')
const Controller = require('./controller')
const schedule = require('./schedule')
const server = http.createServer()

const UPLOAD_DIR = path.resolve(__dirname, "..", "target"); // 大文件存储目录


// schedule.start(UPLOAD_DIR)

const ctrl = new Controller(UPLOAD_DIR)


server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")
  if (req.method === "OPTIONS") {
    res.status = 200
    res.end()
    return
  }
  if (req.method === "POST") {
    if (req.url == '/upload') {
      await ctrl.handleUpload(req,res)
      return 
    }
    if (req.url == '/merge') {
      await ctrl.handleMerge(req,res)
      return 
    }
    if (req.url == '/verify') {
      await ctrl.handleVerify(req,res)
      return 
    }
  }

})

server.listen(3000, () => console.log("正在监听 3000 端口"))
