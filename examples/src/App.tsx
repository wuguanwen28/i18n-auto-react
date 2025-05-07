import React from 'react'
import { changeLanguage, currentLanguage } from 'i18n-auto-react'

type AppProps = {}

export const App: React.FC<AppProps> = () => {
  const text = '你好'
  const text2 = `${text} 世界\${!!}`

  return (
    <div title="哈哈" className={'嘿嘿'}>
      嘿嘿
      <button
        onClick={() => {
          changeLanguage(currentLanguage() === 'zh' ? 'en' : 'zh')
        }}
      >
        {text2}
      </button>
    </div>
  )
}

export default App
