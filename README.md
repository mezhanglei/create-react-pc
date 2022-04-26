# react-web脚手架

## 项目安装和依赖说明
```
说明：基于webpack5.x + react16.x + redux + react-redux + dva-core + ant-design等web开发脚手架,支持typescript
依赖管理(注意设置合适的数据源): 
npm install ---会创建package-lock.json
```
### 项目运行说明
```
npm run start 运行项目
npm run dll 如果想对某些基础包进行预编译,在webpack.dll.js中配置相关基础包,然后启动,最后在html中script引进
npm run build:sit 测试打包
npm run build:prod 生产打包
npm run eslint 检查js规范
npm run csslint 检查css规范
```

### 脚手架功能说明(mddir)
```
1. 单页面开发, 纯净友好无冗余代码脚手架,开箱修改即用, 使用时注意遵循规范,看清楚目录结构!
2. 支持typescript开发
```

### css样式(两种解析方式)
```
建议：1. css嵌套最好不要超过四层
      2. 尽量不要写行内样式
解析方式(自行选择)：
1： .less后缀的文件则是普通的样式文件，有变量污染的可能
2： .module.less后缀的样式文件会开启css module作用域, 可以避免变量污染
   注意:
   (1) 引入方式: import styles from "xxx.module.less"
   (2) 对于代码中的普通class类名, 可以通过:global {} 包裹,在里面书写类名来修改样式
   (3) 动画类名hash化，需要在样式文件中的类名后面加:local 例如 .animation :local {animation: 动画名 all 1s }
```
### image和background背景等静态资源引入规则
```
1. 在js文件中require('路径')或import * from('路径')形式
2. css文件中, 例如background: url('图片的相对路径');
3. 本地的图片资源必须要手动压缩，大图片在200kb以内，尽量不要超过200kb，可以使用tinypng在线压缩图片资源，可以重复压缩
```
### 本地mock数据模拟接口请求使用规则(非常简单)
```
1. 创建mock数据例如: 
  1. 如果接口是 '/list', 则在mock文件夹下创建list.json,里面写json数据即可
  2. 如果接口是 '/home/list', 则在mock文件夹下的home文件夹下创建list.json,里面写json数据即可
  以此类推
2. npm run start-mock启动mock数据环境
```
### 目录说明和相应规范
```
    |-- .babelrc //babel配置文件
    |-- .eslintrc.js //eslint规则配置
    |-- .gitignore  // git提交忽略
    |-- .prettier.config.js //prettier插件配置信息
    |-- .stylelintrc.js // stylelint插件配置信息
    |-- package.json
    |-- postcss.config.js // postcss配置信息
    |-- tsconfig.json // ts配置
    |-- less         // 全局的基础css配置文件夹, 全局样式写在这里
    |   |-- base   // 基础原子标签样式和公共基础类
    |   |-- components // ui组件库的自定义样式(自定义组件和开源ui组件)
    |   |-- constants // 公共的less常量
    |   |-- fonts // 字体文件
    |   |-- pages  // 页面业务相关的公共类
    |       |-- index.less
    |-- src
    |   |-- components // 全局要使用的组件必须要放在这里
    |   |-- constants // 项目所有的常量必须全部放在这里, 一个子文件代表一个功能模块，禁止在别处定义常量,分散不宜管理
    |   |-- core // 项目的业务代码都放在这里(公共的业务文件,兼容处理等等放在这里)
    |   |-- http      // 请求配置文件
    |   |   |-- config.js
    |   |   |-- jsonpRequest.js
    |   |   |-- request.js
    |   |-- mock // mock数据文件夹(看上面使用说明)
    |   |-- pages // 单页面代码所在文件夹
    |   |   |-- index.js // 入口js文件
    |   |   |-- index.html // html模板
    |   |-- routes // 路由所在文件夹
    |   |-- services // 接口所在文件夹
    |   |-- store    // redux仓库
    |   |-- utils   // js工具方法
    |-- static     // 打包时要拷贝的静态资源
    |-- webpack   // webpack配置文件夹
        |-- configs.js  // 自定义配置
        |-- paths.js  // 目录配置
        |-- webpack.base.js // 基础配置环境
        |-- webpack.dev.js // 开发环境
        |-- webpack.dll.js // 预编译文件(需要预编译时使用)
        |-- webpack.prod.js // 生产环境
```
