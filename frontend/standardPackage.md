# 封装一个标准的 NPM 包

## 前言
NPM 包在前端项目中非常常见，我们在日常开发中也经常需要封装一些公共组件或者模块给别人使用，因此封装一个比较标准的 NPM 包十分重要。笔者在 `Github` 上浏览完很多的开源项目结构后，发现一个规范的组件或者框架一般具有良好的代码风格和规范的 commit message，以及 `README` 介绍、打包构建、单元测试等常用功能，下面我们就开始编写一个比较标准的 NPM 包。这篇文章以实践为主，开发过程中使用到的一些工具大家可以直接去对应的官网学习。  
[源代码地址](https://github.com/sunmaer/package)

## 项目结构
```
├── .babelrc            // babel 配置
├── .commitlintrc.js    // git commit 配置
├── .eslintrc.js        // eslint 配置
├── .gitignore          // git 忽略文件
├── .npmignore          // npm 忽略文件
├── README.md           // 项目介绍
├── dist                // 生产目录
│   └── bundle.js       // 打包后的 js 文件
├── package-lock.json 
├── package.json        // 项目配置
├── src                 // 源文件目录
│   ├── index.js        // 入口文件
│   └── util.js         // 功能函数
└── webpack.config.js   // webpack 配置

```

## 发布步骤

### 技术栈
- 打包工具：`Webpack4`
- 编译器：`Babel7`
- 编码规范：`Eslint`
- git commit 规范：基于 [Angular 规范](https://www.conventionalcommits.org/zh-hans/v1.0.0-beta.4/)
- 单元测试：`Jest`

### 开始

#### 新建项目
```sh
mkdir package
cd package
npm init
```

#### 安装 ESlint

> [ESLint](https://cn.eslint.org/) 是一个 可组装的 JavaScript 和 JSX 检查工具，可以用来保证写出语法正确、风格统一的代码。

```sh
npm install eslint -g
eslint --init
```
然后根据项目需要选择就可以了。

#### 配置 Commitlint

> [commitlint](https://commitlint.js.org/#/) 是一个代码的提交规范校验工具，优雅、清晰的提交历史方便团队协作和快速定位问题。

1. 安装 Commitlint 脚手架与 Git Hook 工具
```sh
npm install @commitlint/cli @commitlint/config-conventional husky --save-dev
```

2. 增加 commitlintrc
```sh
echo "module.exports = {extends: ['@commitlint/config-conventional']};" > .commitlintrc.js
```

3. 配置 Git Hooks
```javascript
// package.json
{
  "husky": {
      "hooks": {
          "pre-commit": "eslint src --fix --ext .js",
          "commit-msg": "commitlint -e"
      }
  }
}
```

完成上述步骤后，我们在进行 `git commit` 的时候就会自动化校验修复代码和提交信息。

#### 打包

1. 安装 webpack
```sh
npm install webpack webpack-cli --save-dev
```

2. 增加 webpack.config.js

```!
组件一般需要提供 <script> 和 npm install 两种引入方式，所以我们打包时需要选择 umd 规范。
```

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'package', // 导出变量名
    libraryTarget: 'umd', // 所有的模块定义下都可运行的方式。它将在 CommonJS, AMD 环境下运行，或将模块导出到 global 下的变量
  }
}
```

3. 配置 npm 命令
```javascript
// package.json
"scripts": {
    "build": "webpack"
}
```

#### 编译

```!
在我们开发组件库的过程中，可能会使用到一些 ES6、ES7 语法或者新的 API，而项目打包时为了加快打包构建速度会忽略到 node_modules 下的文件，所以组件最终应该提供一个编译好的 ES5 语法文件，这里我们使用 babel 和 babel polyfill 来编译组件。
```

1. 安装 Babel
```sh
npm install @babel/core @babel/preset-env babel-loader @babel/plugin-transform-runtime @babel/runtime-corejs3 --save-dev
```

2. 增加 .babelrc
```javascript
{
  "presets": [
    ["@babel/preset-env"]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime", {
        "corejs": 3
      }
    ]
  ]
}
```

3. Webpack 配置 babel-loader
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'package',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }]
  }
}
```

#### 开发

新建一个 `src` 文件夹，增加 `index.js` 和 `util.js` 文件，然后我们运行 `npm run build`，可以看到 `dist` 目录下生成了一个打包后的 js 文件。


#### 发布
这样我们就完成了一个比较简单标准的组件，然后我们可以发布到 npm 上给别人使用，也可以将 `dist` 下的 js 文件发布到服务器上。

文章中有什么不对的地方欢迎指出，后续我会加上一些持续集成和单元测试的功能...

## TODO
- [x] 编码规范
- [x] Commit 规范
- [ ] Prettier
- [ ] 持续集成
- [ ] 单元测试
- [ ] 版本控制
- [ ] 组件文档

## 参考文章
- [不容错过的 Babel7 知识](https://juejin.im/post/5ddff3abe51d4502d56bd143)
- [前端代码风格自动化系列（二）之Commitlint](https://segmentfault.com/a/1190000017790694)