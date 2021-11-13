const fse = require('fs-extra')
const path = require('path')
const schedule = require('node-schedule')


// 空目录删除
function remove(file,stats){
    const now = new Date().getTime()
    const offset = now - stats.ctimeMs 
    if(offset>1000*6){
        // 大于60秒的碎片
        console.log(file,'过期了，删除')
        fse.unlinkSync(file)
    }
}

async function scan(dir,callback){
    const files = fse.readdirSync(dir)
    files.forEach(filename=>{
        const fileDir = path.resolve(dir,filename)
        const stats = fse.statSync(fileDir)
        if(stats.isDirectory()){
            return scan(fileDir,remove)
        }
        if(callback){
            callback(fileDir,stats)
        }
    })
}
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
let start = function(UPLOAD_DIR){
    // 每3秒
    // '42 * * * *' 每小时的42分
    // */5 * * * *  没五分钟

    schedule.scheduleJob("*/3 * * * * *",function(){
        console.log('开始扫描')
        scan(UPLOAD_DIR)
    })
}
exports.start = start
// start()