## i18n-auto-translate-react
  * 基于 `i18next` 并结合 `百度翻译API服务` 的自动翻译工具
  * 只需要书写中文，即可自动翻译成其他语言
  * 使用前请去
  <a href="https://api.fanyi.baidu.com/" target="_blank">百度翻译开放平台</a>
  申请 <a href="https://api.fanyi.baidu.com/doc/21" target="_blank">通用文本翻译服务</a>

## 安装
本插件依赖于 `i18next` 库，所以请先安装 `i18next`
 ```sh
npm install i18n-auto-react -D
# or
yarn add i18n-auto-react -D
# or
pnpm install i18n-auto-react -D
 ```

## 使用
### 1. 生成语言包
1. 执行`npx i18n init` 初始化配置 `i18n.config.js`
2. 申请百度翻译API服务后，在 `i18n.config.js` 配置appId和密钥
3. 执行 `npm run i18n:translate` 扫描文件中的中文并翻译成语言包
4. 执行 `npm run i18n:genExport` 生成语言包导出文件


### 2. 添加插件
#### webpack 项目
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: require('i18n-auto-translate').loader,
        options: require('../i18n.config.js') // 路径以实际情况为准
      },
      // ...other loader
    ]
  }
}
```
#### vite 项目
```js
// vite.config.js
import { i18nAutoPlugin } from 'i18n-auto-translate'

export default defineConfig({
  plugins: [
    // ...other plugin
    i18nAutoPlugin()
  ]
})
```
#### 效果展示
插件的作用是把文件中的中文自动替换`i18next`翻译方法

带有注释的，或者本来就有翻译函数包裹的会忽略翻译

转换前
```js
import React from 'react'

let world = '世界'
// i18n-disable-next
let aa = '我是被忽略翻译的中文'
let bb = '我也是被忽略翻译的中文' // i18n-disable
// let cc = _t('我也也是被忽略翻译的中文')

export default function App() {
  return (
    <div>
      <h3 title="花飘万家雪">你好{world}</h3>
      <h3>{aa + bb}</h3>
    </div>
  )
}
```

转换后
```js
import React from 'react';
import { t as _t } from "i18next"; // 自动引入

let world = _t("c086b3008aca0efa8f2ded065d6afb50");
// i18n-disable-next
let aa = '我是被忽略翻译的中文';
let bb = '我也是被忽略翻译的中文'; // i18n-disable

export default function App() {
  return (
    <div>
      <h3 title={_t("29fd4016d2b8d06be750109579b7301e")}>
        {_t("7eca689f0d3389d9dea66ae112e5cfd7")}{world}
      </h3>
      <h3>{aa + bb}</h3>
    </div>
  )
}
```
