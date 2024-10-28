## i18n-auto-react
  * 基于 `百度翻译API服务` 的自动翻译工具
  * 只需要书写中文，即可自动翻译成其他语言
  

## 安装
 ```sh
npm install i18n-auto-react
# or
yarn add i18n-auto-react
# or
pnpm install i18n-auto-react
 ```

## 使用

### 1. 前提准备
1. 使用前请去百度翻译开放平台申请 <a href="https://api.fanyi.baidu.com/doc/21" target="_blank">通用文本翻译服务</a>
2. 执行 `npx i18n init` 初始化配置 `i18n.config.js`
3. 配置 `server.appid` 与 `server.key` (百度翻译服务的密钥)

### 2. 生成语言包
1. 执行 `npx i18n translate` 扫描文件中的中文并翻译成语言包
2. 执行 `npx i18n genExport` 生成语言包导出文件


### 3. 添加插件
#### webpack 项目
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: 'i18n-auto-react/webpack',
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
import { i18nAutoPlugin } from 'i18n-auto-react/vite'

export default defineConfig({
  plugins: [
    // ...other plugin
    i18nAutoPlugin()
  ]
})
```
#### 效果展示
* 插件的作用是把文件中的中文自动替换为`翻译函数`调用
* 带有注释的 (`aa, bb`)，或者本来就有翻译函数包裹 (`cc`) 的会忽略翻译

转换前
```js
import React from 'react'
import { i18n as _i18n } from 'i18n-auto-react'

let world = '世界'
// i18n-disable-next
let aa = '我是被忽略翻译的中文'
let bb = '我也是被忽略翻译的中文' // i18n-disable
let cc = _i18n('我也也是被忽略翻译的中文')

export default function App() {
  return (
    <div>
      <h3 title="花飘万家雪">你好{world}</h3>
      <h3>{aa + bb + cc}</h3>
    </div>
  )
}
```

转换后
```js
import React from 'react';
// 如当前页面有需要翻译的中文时，会自动引入
import { i18n as _i18n } from "i18n-auto-react";

let world = _i18n("c086b3008aca0efa8f2ded065d6afb50");
// i18n-disable-next
let aa = '我是被忽略翻译的中文';
let bb = '我也是被忽略翻译的中文'; // i18n-disable
let cc = _i18n('我也也是被忽略翻译的中文')

export default function App() {
  return (
    <div>
      <h3 title={_i18n("29fd4016d2b8d06be750109579b7301e")}>
        {_i18n("7eca689f0d3389d9dea66ae112e5cfd7")}{world}
      </h3>
      <h3>{aa + bb + cc}</h3>
    </div>
  )
}
```

### 4. 切换语言
```ts
import React from 'react'
import { changeLanguage, currentLanguage } from 'i18n-auto-react'

export default function App() {
  return (
    <div>
      <button
        onClick={() => {
          // 获取当前语言
          let currLng = currentLanguage()
          // 切换语言
          changeLanguage(currLng == 'zh' ? 'en' : 'zh')
        }}
      >
        切换语言
      </button>
    </div>
  )
}
```
